export function ConnectionFailedError() {
  return (
    <>
      <h1 class="text-red-400 font-semibold text-6xl">
        Connection failed error
      </h1>
      <div class="text-3xl pt-8">
        <p>Connecting to the specified app failed.</p>
        <p>
          Make sure that your app is running and you are trying to reach it on
          the correct ip and port.
        </p>
      </div>
    </>
  );
}
