/* eslint-disable @typescript-eslint/no-explicit-any */
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
      'id, name, description, price, isvegetarian, isspicy, category, menu_img, sold_out, square_variation_id'
    );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!items) return NextResponse.json([], { status: 200 });

  // 2. Gather all square_variation_ids
  const variationIds = items
    .map((item: any) => item.square_variation_id)
    .filter((id: string | null) => !!id);

  // 3. Fetch Square availability
  let squareAvailability: Record<string, boolean> = {};
  try {
    squareAvailability = await fetchSquareAvailability(variationIds);
  } catch (e) {
    // fallback: treat all as available
    squareAvailability = {};
  }

  // 4. Merge: sold_out (Supabase) OR not available (Square)
  const merged = items.map((item: any) => ({
    ...item,
    isSoldOut: !!item.sold_out || (item.square_variation_id ? !squareAvailability[item.square_variation_id] : false)
  }));

  return NextResponse.json(merged, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=59'
    }
  });
} 