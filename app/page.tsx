import { TodayHeader } from "@/components/today-header";

// Screen A: TODAY. Phase 1 step 1 = the frame. Features land here step by step.
export default function TodayPage() {
  return (
    <main className="screen">
      <TodayHeader />
      <div className="flex-1" />
      <form action="/auth/signout" method="post" className="mt-12 text-center">
        <button className="btn-quiet">Sign out</button>
      </form>
    </main>
  );
}
