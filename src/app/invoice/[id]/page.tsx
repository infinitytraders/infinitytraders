import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FileText, Printer, Check } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 0;

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const resolvedParams = await params;
  const order = await db.getOrderById(resolvedParams.id);

  if (!order) {
    notFound();
  }

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    dateStyle: 'medium',
  });

  const isIntrastate = order.shippingAddress.state.toLowerCase().includes('jharkhand');
  
  // Tax computations
  // Since sellingPrice is GST-inclusive:
  // Base Price = sellingPrice / 1.18
  // Total Tax = sellingPrice - Base Price
  const totalTaxableValue = Math.round(order.orderValue / 1.18);
  const totalGst = order.gstAmount;

  return (
    <div className="min-h-screen bg-white text-slate-800 p-4 sm:p-8 flex flex-col justify-between items-center -mt-24 pt-32">
      {/* Invoice controls (non-printable) */}
      <div className="max-w-4xl w-full bg-slate-100 border border-slate-200 rounded p-4 mb-6 flex flex-wrap justify-between items-center gap-4 print:hidden">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-slate-600" />
          <span className="text-sm font-semibold">Indian GST Tax Invoice - {order.id}</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/account"
            className="px-4 py-2 border border-slate-300 hover:bg-slate-200 rounded text-xs font-semibold text-slate-700 transition-colors"
          >
            Back to Dashboard
          </Link>
          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Invoice / Save PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="max-w-4xl w-full bg-white border border-slate-300 p-8 sm:p-12 shadow-sm flex flex-col justify-between print:border-none print:p-0 print:shadow-none space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold tracking-wider text-slate-900">INFINITY TRADERS</h1>
            <p className="text-xs text-slate-500 font-light max-w-xs leading-relaxed">
              Official Multi-Brand Footwear & Lifestyle Distributor<br />
              HQ: Bank More, Dhanbad, Jharkhand - 826001<br />
              Email: compliance@infinitytraders.com<br />
              <strong>GSTIN: 20ABCDE1234F1Z5</strong>
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <h2 className="text-lg font-bold text-slate-900 uppercase">Tax Invoice</h2>
            <p className="text-xs text-slate-500">
              Invoice No: <strong className="text-slate-800">{order.id}</strong><br />
              Date: {orderDate}<br />
              Payment Status: <strong className="text-slate-800">{order.paymentStatus} ({order.paymentMethod})</strong><br />
              Place of Supply: {order.shippingAddress.state}
            </p>
          </div>
        </div>

        {/* Addresses block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-slate-200 pb-6 text-xs leading-relaxed">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Billed To (Customer):</h3>
            <p className="font-semibold text-sm text-slate-900">{order.customerName}</p>
            <p>Email: {order.customerEmail}</p>
            <p>Mobile: +91 {order.customerMobile}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Shipping Destination:</h3>
            <p className="font-semibold text-sm text-slate-900">{order.customerName}</p>
            <p>{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - <strong className="text-slate-950">{order.shippingAddress.pincode}</strong></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-2.5">S.No.</th>
                <th className="py-2.5">Article Description</th>
                <th className="py-2.5 text-center">HSN Code</th>
                <th className="py-2.5 text-center">Size</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Unit Price (Incl. GST)</th>
                <th className="py-2.5 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3">{idx + 1}</td>
                  <td className="py-3 font-medium text-slate-900">
                    {item.name} ({item.brand})
                  </td>
                  <td className="py-3 text-center text-slate-500">6403 (Footwear)</td>
                  <td className="py-3 text-center">UK {item.size}</td>
                  <td className="py-3 text-center">{item.quantity}</td>
                  <td className="py-3 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial calculations and GST breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-slate-200 pt-6">
          {/* Tax breakdown details */}
          <div className="md:col-span-7 bg-slate-50 p-4 border border-slate-200 rounded text-[11px] space-y-2 text-slate-600 leading-relaxed">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[9px] mb-1">GST Taxation Summary Breakdown:</h4>
            <div className="flex justify-between border-b border-slate-100 pb-1">
              <span>Total Taxable Value (Base Price):</span>
              <span>₹{totalTaxableValue.toLocaleString('en-IN')}</span>
            </div>
            
            {isIntrastate ? (
              <>
                <div className="flex justify-between border-b border-slate-100 pb-1">
                  <span>Central GST (CGST @ 9%):</span>
                  <span>₹{Math.round(totalGst / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>State GST (SGST @ 9%):</span>
                  <span>₹{Math.round(totalGst / 2).toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span>Integrated GST (IGST @ 18%):</span>
                <span>₹{totalGst.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-slate-200 pt-1 flex justify-between font-semibold text-slate-800">
              <span>Total GST Tax Liability:</span>
              <span>₹{totalGst.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Checkout Totals */}
          <div className="md:col-span-5 text-right text-xs space-y-2 text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-medium text-slate-900">₹{order.orderValue.toLocaleString('en-IN')}</span>
            </div>
            {order.couponApplied && (
              <div className="flex justify-between text-[#10b981]">
                <span>Coupon ({order.couponApplied}):</span>
                <span>- ₹{(order.orderValue + order.shippingCharges - order.finalAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Standard Delivery Charges:</span>
              <span className="font-medium text-slate-900">
                {order.shippingCharges === 0 ? 'FREE' : `₹${order.shippingCharges}`}
              </span>
            </div>
            <div className="border-t border-slate-300 pt-2 flex justify-between font-bold text-sm text-slate-950">
              <span>Net Payable Amount:</span>
              <span className="text-lg">₹{order.finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Legal disclosures & Stamp Signature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-slate-200 pt-8 text-[10px] text-slate-400 leading-relaxed uppercase tracking-wider">
          <div className="space-y-1">
            <p className="font-bold text-slate-500">Terms of Sale & Disclosures:</p>
            <p>1. Certified goods sold are final for tax declarations.</p>
            <p>2. Subject to Dhanbad, Jharkhand jurisdiction disputes.</p>
            <p>3. Payments are secured & coordinated by Razorpay.</p>
          </div>
          <div className="text-left sm:text-right flex flex-col justify-end items-start sm:items-end">
            <div className="border border-slate-200 p-2 text-center rounded w-48 bg-slate-50/50 mb-2 border-dashed">
              <span className="text-[9px] font-bold text-slate-400 block uppercase">Authorized Signature</span>
              <div className="h-6 flex items-center justify-center">
                <Check className="w-5 h-5 text-emerald-600 stroke-[3]" />
              </div>
              <span className="text-[9px] text-slate-500 block">Infinity Traders Compliance</span>
            </div>
            <p>Thank you for shopping with Infinity Traders!</p>
          </div>
        </div>

      </div>
    </div>
  );
}
