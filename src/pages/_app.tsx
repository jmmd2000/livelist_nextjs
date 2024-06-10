import { GeistSans } from "geist/font/sans";
import { type AppType } from "next/app";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Layout } from "~/components/layout";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <main className={GeistSans.className}>
      <ClerkProvider {...pageProps}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ClerkProvider>
    </main>
  );
};

export default api.withTRPC(MyApp);
