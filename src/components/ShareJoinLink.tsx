export default function ShareJoinLink({ id }: { id: string }) {
  return (
    <div className="flex flex-col gap-1 relative my-4 w-full px-4 top-4 bg-blue-50 py-4 md:rounded-md">
      <label className="text-sm absolute -top-5">Share Join Link</label>
      <input
        type="text"
        className="rounded-md border w-full border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        onFocus={(e) => e.target.select()}
        readOnly
        value={`${window.location.origin}/join/${id}`}
      />
    </div>
  );
}
