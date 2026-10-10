import { PageHeader } from "@/components/layout/page-header";
import { AddCategoryForm } from "@/features/categories/components/add-category-form";
import { CategoryRow } from "@/features/categories/components/category-row";
import { listCategoriesWithCounts } from "@/features/categories/queries";

export default async function CategoriesPage() {
  const categories = await listCategoriesWithCounts();

  return (
    <>
      <PageHeader
        title="Categories"
        description="Group your expenses. Renaming keeps past expenses in the category."
      />

      <div className="mb-6 rounded-2xl border border-line bg-surface p-5">
        <AddCategoryForm />
      </div>

      <ul className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface">
        {categories.map((category) => (
          <CategoryRow
            key={category.id}
            category={category}
            others={categories.filter((other) => other.id !== category.id)}
          />
        ))}
      </ul>
    </>
  );
}
