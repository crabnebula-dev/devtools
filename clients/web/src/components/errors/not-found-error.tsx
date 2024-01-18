export function NotFoundError() {
  return (
    <>
      <h1 class="text-red-400 font-semibold text-6xl">404 - Not Found</h1>
      <div class="text-3xl pt-8">
        <p>The path your were trying to reach does not exist.</p>
        <p>If you think it should, don't worry we are already notified.</p>
      </div>
    </>
  );
}
