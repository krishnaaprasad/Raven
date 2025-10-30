import ProductClient from './ProductClient'

export default async function Page({ params }) {
  const { slug } = await params; // await here
  return <ProductClient slug={slug} />;
}
