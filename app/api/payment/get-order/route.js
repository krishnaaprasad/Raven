import { NextResponse } from 'next/server'
import connectToDatabase from '@/lib/mongodb'
import Order from '@/models/Order'

export async function GET(req) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')
    const order = await Order.findById(orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    return NextResponse.json({ order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
