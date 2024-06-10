/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { type PropsWithChildren, useState, useEffect } from "react";
import { api } from "~/utils/api";
import { Menu, X, Bell, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { PuffLoader } from "react-spinners";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { type ListRequest } from "types";
// import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
import { Toaster } from "sonner";
// import { useToastEffect } from "~/hooks/useToastEffect";
// import { set } from "zod";
// import { Analytics } from "@vercel/analytics/react";

export const Layout = (props: PropsWithChildren) => {
  return (
    <div>
      <Navbar />
      <main>{props.children}</main>
      <Toaster />
      {/* <Analytics /> */}
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = useUser();
  // check if the current page is the homepage
  const router = useRouter();
  const isHomePage = router.pathname === "/";
  return (
    <nav
      className={`bg-gray-0 glass ${
        isHomePage ? "fixed" : "sticky"
      } left-0 top-0 z-10 w-full`}
    >
      <div className="mr-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              {/* Website Logo */}
              <Link href="/" passHref legacyBehavior>
                <a className="flex items-center px-2 py-4">
                  <span className="text-2xl font-semibold text-gray-200">
                    LiveList
                  </span>
                </a>
              </Link>
            </div>
            {/* Primary Navbar items */}
            <div className="hidden items-center space-x-1 md:flex">
              <Link href="/lists" passHref legacyBehavior>
                <a className="px-2 py-4 font-semibold text-gray-500 hover:text-gray-300">
                  Lists
                </a>
              </Link>
              <Link href="/products" passHref legacyBehavior>
                <a className="px-2 py-4 font-semibold text-gray-500 hover:text-gray-300">
                  Products
                </a>
              </Link>
            </div>
          </div>
          {/* Secondary Navbar items */}
          <div className="ml-auto hidden items-center space-x-3 md:flex">
            <RequestSidebar />
            {!user.isSignedIn && (
              <SignInButton forceRedirectUrl="/">
                <Button variant="outline">Login</Button>
              </SignInButton>
            )}
            {!!user.isSignedIn && (
              <SignOutButton>
                <Button variant="outline">Log Out</Button>
              </SignOutButton>
            )}
          </div>
          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button type="button" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? (
                <X className="h-6 w-6 text-gray-500" />
              ) : (
                <Menu className="h-6 w-6 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      <div className={`md:hidden ${isOpen ? "block" : "hidden"}`}>
        <Link href="/lists" passHref legacyBehavior>
          <a className="block px-8 py-4 text-sm font-semibold text-white">
            Lists
          </a>
        </Link>
        <Link href="/products" passHref legacyBehavior>
          <a className="block px-8 py-4 text-sm font-semibold text-white">
            Products
          </a>
        </Link>
        <div className="flex w-full items-center justify-center gap-4 pb-6">
          <RequestSidebar />
          {!user.isSignedIn && (
            <SignInButton forceRedirectUrl="/">
              <Button variant="outline" size="sm">
                Login
              </Button>
            </SignInButton>
          )}
          {!!user.isSignedIn && (
            <SignOutButton>
              <Button variant="outline" size="sm">
                Log Out
              </Button>
            </SignOutButton>
          )}
        </div>
      </div>
    </nav>
  );
};

const RequestSidebar = () => {
  const { data, refetch } = api.listRequest.getAllWithMember.useQuery(
    undefined,
    {
      enabled: false,
    },
  );
  const user = useUser();

  useEffect(() => {
    if (user.isSignedIn) {
      void refetch();
    }
  }, [refetch, user.isSignedIn]);
  return (
    <Sheet>
      <SheetTrigger>
        <div className="rounded-md bg-zinc-100 p-2 hover:bg-zinc-200">
          <Bell />
        </div>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>List Requests</SheetTitle>
          <SheetDescription>
            When people send you list requests, they'll show up here.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-8 flex flex-col gap-4">
          {data?.map((listRequest) => (
            <ListRequestCard
              key={listRequest.id}
              listRequest={listRequest}
              refetch={refetch}
            />
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export const ListRequestCard = (props: {
  listRequest: ListRequest;
  revokeable?: boolean;
  refetch?: () => void;
}) => {
  const { listRequest, revokeable = false, refetch } = props;
  const router = useRouter();

  const [requestAccepted, setRequestAccepted] = useState(false);
  const [requestDeclined, setRequestDeclined] = useState(false);
  const [requestRevoked, setRequestRevoked] = useState(false);

  const {
    mutate: acceptListRequest,
    isPending: acceptingRequest,
    error: cantAcceptRequest,
  } = api.listRequest.accept.useMutation();
  const {
    mutate: declineListRequest,
    isPending: decliningRequest,
    error: cantDeclineRequest,
  } = api.listRequest.decline.useMutation();

  const {
    mutate: revokeListRequest,
    isPending: revokingRequest,
    error: cantRevokeRequest,
  } = api.listRequest.revoke.useMutation();

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-zinc-700 bg-zinc-700 bg-opacity-10 bg-clip-padding p-4 shadow-lg backdrop-blur-lg backdrop-filter">
      <div className="flex flex-col items-start">
        <h1 className="text-xl font-semibold text-zinc-300">
          {listRequest.list.name}
        </h1>
        {/* //* Very dirty way of accessing this, but since there's max 2 players, the person who sent the request will always be the user here */}
        <p className="text-sm font-medium text-zinc-500">
          {listRequest.list.members[0]?.user.first_name}
        </p>
      </div>
      {listRequest.status === "pending" && !revokeable && (
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-green-500 hover:bg-green-600"
            onClick={() => {
              acceptListRequest(
                {
                  list_id: listRequest.list_id,
                  from_user_google_id: listRequest.from_user_google_id,
                },
                {
                  onSuccess: () => {
                    setRequestAccepted(true);
                    if (refetch) {
                      refetch();
                    }
                  },
                },
              );
            }}
            disabled={decliningRequest || acceptingRequest}
          >
            {acceptingRequest ? <PuffLoader size={20} /> : <Check />}
          </Button>
          <Button
            size="sm"
            className="bg-red-500 hover:bg-red-600"
            onClick={() => {
              declineListRequest(
                {
                  list_id: listRequest.list_id,
                  from_user_google_id: listRequest.from_user_google_id,
                },
                {
                  onSuccess: () => {
                    setRequestDeclined(true);
                    if (refetch) {
                      refetch();
                    }
                  },
                },
              );
            }}
            disabled={decliningRequest || acceptingRequest}
          >
            {decliningRequest ? <PuffLoader size={20} /> : <X />}
          </Button>
        </div>
      )}
      {listRequest.status === "pending" && !!revokeable && (
        <>
          <p className="text-zinc-600">Pending...</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                revokeListRequest(
                  {
                    list_id: listRequest.list_id,
                    member_id: listRequest.to_user_google_id,
                  },
                  {
                    onSuccess: () => {
                      setRequestRevoked(true);
                      if (refetch) {
                        refetch();
                      }
                    },
                    onError: () => {
                      setRequestRevoked(false);
                    },
                  },
                );
              }}
              disabled={revokingRequest}
            >
              {revokingRequest ? <PuffLoader size={20} /> : "Revoke"}
            </Button>
          </div>
        </>
      )}
      {listRequest.status === "rejected" && !!revokeable && (
        <>
          <p className="text-red-600">Rejected</p>
          <div className="flex gap-2">
            {requestRevoked ? (
              <p>Revoked: {requestRevoked}</p>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  revokeListRequest(
                    {
                      list_id: listRequest.list_id,
                      member_id: listRequest.to_user_google_id,
                    },
                    {
                      onSuccess: () => {
                        setRequestRevoked(true);
                        if (refetch) {
                          refetch();
                        }
                      },
                      onError: () => {
                        setRequestRevoked(false);
                      },
                    },
                  );
                }}
                disabled={revokingRequest}
              >
                {revokingRequest ? <PuffLoader size={20} /> : "Revoke"}
              </Button>
            )}
          </div>
        </>
      )}
      {listRequest.status === "accepted" && (
        <p className="text-green-600">Accepted</p>
      )}
      {listRequest.status === "rejected" && !revokeable && (
        <p className="text-red-600">Rejected</p>
      )}
    </div>
  );
};
