import { supabaseServer } from '@/lib/supabaseServer'

export default async function Inventory() {
  const s = supabaseServer()
  const { data: { session } } = await s.auth.getSession()
  const { data: mems } = await s.from('organization_members').select('*').eq('user_id', session!.user.id)
  const org = mems?.[0]?.org_id

  const { data: items } = await s.from('items').select('id,item_sku,name,category').eq('org_id', org).order('name')

  return (
    <main>
      <h1 className="text-xl font-semibold mb-4">Inventory</h1>
      <table className="w-full text-sm">
        <thead><tr><th className="text-left p-2">SKU</th><th className="text-left p-2">Name</th><th className="text-left p-2">Category</th></tr></thead>
        <tbody>
          {items?.map(it => (
            <tr key={it.id} className="odd:bg-neutral-100">
              <td className="p-2">{it.item_sku}</td>
              <td className="p-2">{it.name}</td>
              <td className="p-2">{it.category}</td>
            </tr>
          )) || <tr><td colSpan={3} className="p-2">No items yet.</td></tr>}
        </tbody>
      </table>
    </main>
  )
}
