"use client";
import { Suspense } from "react";
import OrderSuccess from "./OrderSuccess";

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-lg">Loading...</div>}>
      <OrderSuccess />
    </Suspense>
  );
}
