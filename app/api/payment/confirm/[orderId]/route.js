import connectToDatabase from '@/lib/mongodb'
import Order from '@/models/Order'
import { NextResponse } from 'next/server'

export async function POST(req, { params }) {
  try {
    await connectToDatabase()
    const order = await Order.findById(params.orderId)
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    order.paymentStatus = 'paid'
    await order.save()

    return NextResponse.json({ message: 'Payment confirmed' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}
