import ProductClient from './ProductClient'

export default async function Page({ params }) {
  const { slug } = await params
  return <ProductClient slug={slug} />
}
