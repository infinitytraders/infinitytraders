import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import { FileText, Check } from 'lucide-react';
import Link from 'next/link';
import PrintButton from '@/components/PrintButton';

export const revalidate = 0;
export const runtime = 'edge';

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
  const totalTaxableValue = Math.round(order.orderValue / 1.18);
  const totalGst = order.gstAmount;

  return (
    <div className="min-h-screen bg-[#f4f3ef] text-black p-4 sm:p-8 flex flex-col justify-start items-center pt-28 print:bg-white print:p-0 print:pt-0 print:block">
      {/* Invoice controls (non-printable) */}
      <div className="max-w-4xl w-full bg-white border border-black/5 rounded-2xl p-4 mb-6 flex flex-wrap justify-between items-center gap-4 print:hidden shadow-xs">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-black/60" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-black">GST Tax Invoice &mdash; {order.id}</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/account"
            className="px-4 py-2 border border-black/10 hover:border-black rounded-full text-[10px] font-bold text-black uppercase tracking-widest transition-all bg-white"
          >
            Dashboard
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div className="max-w-4xl w-full bg-white border border-black/5 p-8 sm:p-12 rounded-3xl shadow-xs flex flex-col justify-between print:border-none print:p-0 print:shadow-none space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-black/5 pb-6 print:flex-row print:justify-between print:items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <svg className="w-8 h-8 text-black" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M30 35 C15 35 15 65 30 65 C45 65 55 35 70 35 C85 35 85 65 70 65 C55 65 45 35 30 35 Z" 
                  stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              <div className="flex flex-col leading-none">
                <span className="text-[12px] font-extrabold tracking-[0.2em] text-black uppercase">
                  INFINITY
                </span>
                <span className="text-[8px] font-light tracking-[0.25em] text-black/60 uppercase mt-0.5">
                  TRADERS
                </span>
              </div>
            </div>
            <p className="text-[10px] text-black/65 font-bold uppercase tracking-wider leading-relaxed">
              Multi-Brand Footwear & Lifestyle Distributor<br />
              HQ: Bank More, Dhanbad, Jharkhand &mdash; 826001<br />
              Email: compliance@infinitytraders.shop<br />
              <strong>GSTIN: 20ABCDE1234F1Z5</strong>
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <h2 className="text-sm font-extrabold text-black uppercase tracking-widest">Tax Invoice</h2>
            <p className="text-[10px] text-black/60 font-bold uppercase tracking-wider leading-relaxed">
              Invoice No: <strong className="text-black font-extrabold">{order.id}</strong><br />
              Date: {orderDate}<br />
              Payment: <strong className="text-black font-extrabold">{order.paymentStatus} ({order.paymentMethod})</strong><br />
              State of Supply: {order.shippingAddress.state}
            </p>
          </div>
        </div>

        {/* Addresses block */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-black/5 pb-6 text-xs leading-relaxed print:grid-cols-2 print:gap-6">
          <div className="space-y-1">
            <h3 className="font-extrabold text-black/45 uppercase tracking-widest text-[9px]">Billed To (Customer):</h3>
            <p className="font-extrabold text-sm text-black">{order.customerName}</p>
            <p className="font-medium text-black/70">Email: {order.customerEmail}</p>
            <p className="font-medium text-black/70">Mobile: +91 {order.customerMobile}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-black/45 uppercase tracking-widest text-[9px]">Shipping Destination:</h3>
            <p className="font-extrabold text-sm text-black">{order.customerName}</p>
            <p className="font-medium text-black/70">{order.shippingAddress.street}</p>
            <p className="font-medium text-black/70">{order.shippingAddress.city}, {order.shippingAddress.state} &mdash; <strong className="text-black font-extrabold">{order.shippingAddress.pincode}</strong></p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-black/10 text-black/45 font-bold uppercase tracking-widest text-[9px]">
                <th className="py-3">S.No.</th>
                <th className="py-3">Article Description</th>
                <th className="py-3 text-center">HSN Code</th>
                <th className="py-3 text-center">Size</th>
                <th className="py-3 text-center">Qty</th>
                <th className="py-3 text-right">Unit Price (Incl. GST)</th>
                <th className="py-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 text-black/70 font-bold">
              {order.items.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-3.5 font-medium">{idx + 1}</td>
                  <td className="py-3.5 text-black font-extrabold">
                    {item.name} &mdash; <span className="font-bold text-black/50 text-[10px] uppercase tracking-wider">{item.brand}</span>
                  </td>
                  <td className="py-3.5 text-center font-medium text-black/40">6403 (Footwear)</td>
                  <td className="py-3.5 text-center font-extrabold">UK {item.size}</td>
                  <td className="py-3.5 text-center font-extrabold">{item.quantity}</td>
                  <td className="py-3.5 text-right">₹{item.price.toLocaleString('en-IN')}</td>
                  <td className="py-3.5 text-right text-black font-extrabold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Financial calculations and GST breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 border-t border-black/5 pt-6 print:grid-cols-12 print:gap-6">
          {/* Tax breakdown details */}
          <div className="md:col-span-7 bg-[#fcfbf9] p-4 border border-black/5 rounded-2xl text-[10px] space-y-2 text-black/70 leading-relaxed font-bold print:col-span-7 print:bg-transparent print:p-2">
            <h4 className="font-extrabold text-black uppercase tracking-widest text-[9px] mb-1">GST Taxation Summary Breakdown:</h4>
            <div className="flex justify-between border-b border-black/5 pb-1">
              <span className="uppercase tracking-wider text-[8px] text-black/45">Total Taxable Value (Base Price):</span>
              <span className="text-black">₹{totalTaxableValue.toLocaleString('en-IN')}</span>
            </div>
            
            {isIntrastate ? (
              <>
                <div className="flex justify-between border-b border-black/5 pb-1">
                  <span className="uppercase tracking-wider text-[8px] text-black/45">Central GST (CGST @ 9%):</span>
                  <span className="text-black">₹{Math.round(totalGst / 2).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="uppercase tracking-wider text-[8px] text-black/45">State GST (SGST @ 9%):</span>
                  <span className="text-black">₹{Math.round(totalGst / 2).toLocaleString('en-IN')}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between">
                <span className="uppercase tracking-wider text-[8px] text-black/45">Integrated GST (IGST @ 18%):</span>
                <span className="text-black">₹{totalGst.toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="border-t border-black/5 pt-1.5 flex justify-between font-extrabold text-black">
              <span className="uppercase tracking-widest text-[9px]">Total GST Tax Liability:</span>
              <span className="underline">₹{totalGst.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Checkout Totals */}
          <div className="md:col-span-5 text-right text-xs space-y-2 text-black/60 font-bold print:col-span-5">
            <div className="flex justify-between">
              <span className="uppercase tracking-wider text-[9px]">Subtotal:</span>
              <span className="font-extrabold text-black">₹{order.orderValue.toLocaleString('en-IN')}</span>
            </div>
            {order.couponApplied && (
              <div className="flex justify-between text-teal-800">
                <span className="uppercase tracking-wider text-[9px]">Coupon ({order.couponApplied}):</span>
                <span className="font-extrabold">- ₹{(order.orderValue + order.shippingCharges - order.finalAmount).toLocaleString('en-IN')}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="uppercase tracking-wider text-[9px]">Standard Delivery Charges:</span>
              <span className="font-extrabold text-black">
                {order.shippingCharges === 0 ? 'FREE' : `₹${order.shippingCharges}`}
              </span>
            </div>
            <div className="border-t border-black/10 pt-2 flex justify-between font-extrabold text-xs text-black uppercase tracking-widest">
              <span>Net Payable Amount:</span>
              <span className="text-base underline">₹{order.finalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Legal disclosures & Stamp Signature */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 border-t border-black/5 pt-8 text-[9px] text-black/45 leading-relaxed uppercase tracking-wider font-bold print:grid-cols-2 print:gap-6">
          <div className="space-y-1">
            <p className="font-extrabold text-black/60">Terms of Sale & Disclosures:</p>
            <p>1. Certified goods sold are final for tax declarations.</p>
            <p>2. Subject to Dhanbad, Jharkhand jurisdiction disputes.</p>
            <p>3. Payments are secured & coordinated by Razorpay.</p>
          </div>
          <div className="text-left sm:text-right flex flex-col justify-end items-start sm:items-end">
            <div className="border border-black/10 p-2.5 text-center rounded-2xl w-48 bg-[#fcfbf9] mb-2 border-dashed">
              <span className="text-[9px] font-extrabold text-black/45 block uppercase tracking-wider">Authorized Signature</span>
              <div className="h-6 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-700 stroke-[3.5]" />
              </div>
              <span className="text-[9px] text-black/60 font-bold block uppercase tracking-widest">Infinity Traders</span>
            </div>
            <p className="font-extrabold text-black/60">Thank you for shopping with Infinity Traders!</p>
          </div>
        </div>

      </div>
    </div>
  );
}
