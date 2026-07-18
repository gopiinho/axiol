export default function NoOrders() {
  return (
    <div className="p-5 sm:p-8">
      <div className="app-panel border-dotted p-4">
        <div className="flex flex-col gap-2 text-center">
          <h4 className="text-2xl font-semibold">No orders yet</h4>
          <p className="text-muted-foreground text-sm">
            Orders will appear here when customers purchase your products.
          </p>
        </div>
      </div>
    </div>
  );
}
