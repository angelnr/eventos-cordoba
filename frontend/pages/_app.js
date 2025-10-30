export default function MyApp({ Component, pageProps }) {
  return (
    <>
    <Component {...pageProps} />
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        background-color: #fafafa;
      }
      `}</style>
      </>
  );
}
