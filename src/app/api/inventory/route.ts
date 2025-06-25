import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Client, Environment } from 'square/legacy';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const client = new Client({
  bearerAuthCredentials: { accessToken: process.env.SQUARE_ACCESS_TOKEN! },
  environment:
    process.env.SQUARE_ENVIRONMENT?.toLowerCase() === 'production'
      ? Environment.Production
      : Environment.Sandbox,
});

// GET: Fetch current inventory status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('item_id');

    if (itemId) {
      // Get specific item inventory
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, sold_out, square_variation_id')
        .eq('id', itemId)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 404 });
      }

      return NextResponse.json(data);
    } else {
      // Get all items inventory status
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, name, sold_out, square_variation_id')
        .order('name');

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(data);
    }
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Update inventory status (from POS webhook or manual update)
export async function POST(req: NextRequest) {
  try {
    const { item_id, sold_out, square_variation_id, source = 'manual' } = await req.json();

    if (!item_id) {
      return NextResponse.json({ error: 'item_id is required' }, { status: 400 });
    }

    console.log(`Updating inventory for item ${item_id}: sold_out=${sold_out}, source=${source}`);

    // Update in Supabase
    const { data, error } = await supabase
      .from('menu_items')
      .update({ 
        sold_out: sold_out,
        last_inventory_update: new Date().toISOString(),
        inventory_update_source: source
      })
      .eq('id', item_id)
      .select();

    if (error) {
      console.error('Error updating inventory in Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const updatedItem = data[0];

    // If we have a Square variation ID and this update came from website, sync to Square
    if (square_variation_id && source === 'manual') {
      try {
        console.log(`Syncing inventory to Square for variation ${square_variation_id}`);
        
        // Update Square catalog item availability
        const catalogApi = client.catalogApi;
        
        // First retrieve the current item to get version
        const retrieveResponse = await catalogApi.retrieveCatalogObject(square_variation_id, true);
        const currentItem = retrieveResponse.result.object;
        
        if (currentItem) {
          const updateRequest = {
            idempotencyKey: crypto.randomUUID(),
            object: {
              type: 'ITEM_VARIATION' as const,
              id: square_variation_id,
              version: currentItem.version,
              itemVariationData: {
                ...currentItem.itemVariationData,
                availableForPickup: !sold_out,
                availableElsewhere: !sold_out
              }
            }
          };

          const response = await catalogApi.upsertCatalogObject(updateRequest);
          console.log('Square inventory updated:', response.result);
        }
      } catch (squareError) {
        console.error('Error updating Square inventory:', squareError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      item: updatedItem,
      message: `Item ${updatedItem.name} ${sold_out ? 'marked as sold out' : 'marked as available'}`
    });
  } catch (error: any) {
    console.error('Error updating inventory:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Bulk update inventory (useful for POS sync)
export async function PATCH(req: NextRequest) {
  try {
    const { updates } = await req.json();

    if (!Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates must be an array' }, { status: 400 });
    }

    console.log(`Processing bulk inventory update for ${updates.length} items`);

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { item_id, sold_out, square_variation_id } = update;
        
        const { data, error } = await supabase
          .from('menu_items')
          .update({ 
            sold_out: sold_out,
            last_inventory_update: new Date().toISOString(),
            inventory_update_source: 'bulk_pos_sync'
          })
          .eq('id', item_id)
          .select();

        if (error) {
          errors.push({ item_id, error: error.message });
        } else if (data && data.length > 0) {
          results.push({ item_id, success: true, item: data[0] });
        } else {
          errors.push({ item_id, error: 'Item not found' });
        }
      } catch (updateError: any) {
        errors.push({ item_id: update.item_id, error: updateError.message });
      }
    }

    return NextResponse.json({
      success: true,
      updated: results.length,
      errorCount: errors.length,
      results,
      errors
    });
  } catch (error: any) {
    console.error('Error in bulk inventory update:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 