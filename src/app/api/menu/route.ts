import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Helper to fetch Square item variation availability using MCP
async function fetchSquareAvailability(variationIds: string[]): Promise<Record<string, boolean>> {
  if (!variationIds.length) return {};
  // Use MCP to call Square Catalog API
  const res = await fetch(`${process.env.MCP_URL}/square/catalog/batch-retrieve-catalog-objects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.MCP_API_KEY}`
    },
    body: JSON.stringify({
      objectIds: variationIds,
      includeRelatedObjects: false
    })
  });
  if (!res.ok) return {};
  const data = await res.json();
  // Map: variationId -> availableOnline (or true if not found)
  const map: Record<string, boolean> = {};
  (data.objects || []).forEach((obj: any) => {
    map[obj.id] = obj.itemVariationData?.availableOnline !== false;
  });
  return map;
}

export async function GET() {
  // 1. Fetch menu items from Supabase
  const { data: items, error } = await supabase
    .from('menu_items')
    .select(
      'id, name, description, price, isvegetarian, isspicy, category, menu_img, sold_out, square_variation_id, images'
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!items) return NextResponse.json([], { status: 200 });

  // Merge: only DB sold_out field is considered for availability
  const merged = items.map((item: any) => {
    // Merge menu_img into images if images is empty or missing
    let images = item.images;
    if ((!images || images.length === 0) && item.menu_img) {
      images = [item.menu_img];
    } else if (images && item.menu_img && !images.includes(item.menu_img)) {
      images = [item.menu_img, ...images];
    }
    return {
      ...item,
      images,
      isSoldOut: !!item.sold_out
    };
  });

  // Cache results for quick subsequent loads
  return NextResponse.json(merged, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
    }
  });
}

// Create a new menu item
export async function POST(request: Request) {
  try {
    const { name, description, price, isvegetarian, isspicy, category, menu_img, sold_out, square_variation_id, images } = await request.json();
    // Insert and return the created row
    const { data, error } = await supabase
      .from('menu_items')
      .insert([{ name, description, price, isvegetarian, isspicy, category, menu_img, sold_out, square_variation_id, images }])
      .select();
    if (error || !data) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error?.message || 'No data returned' }, { status: 500 });
    }
    return NextResponse.json(data[0], { status: 201 });
  } catch (err) {
    console.error('API POST error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// Update an existing menu item
export async function PATCH(request: Request) {
  const { id, ...updates } = await request.json();
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id);
  if (error || !data) {
    return NextResponse.json({ error: error?.message || 'No data returned' }, { status: 500 });
  }
  return NextResponse.json(data[0], { status: 200 });
}

// Delete a menu item
export async function DELETE(request: Request) {
  const { id } = await request.json();
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true }, { status: 200 });
} 