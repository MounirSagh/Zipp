import React, { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Layout } from "@/components/Layout";

function Feedbacks() {
  const [feedbacks, setFeedbacks] = useState<any>([]);
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<number | null>(
    null
  );
  const { user, isSignedIn } = useUser();
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(0);
  const [totalFeedbacks, setTotalFeedbacks] = useState<number>(0);
  const itemsPerPage = 10;

  // Calculate pagination values
  const totalPages = Math.ceil(totalFeedbacks / itemsPerPage);
  const startIndex = page * itemsPerPage;

  const goToNextPage = () => {
    if (page < totalPages - 1) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchFeedbacks(nextPage);
    }
  };

  const goToPrevPage = () => {
    if (page > 0) {
      const prevPage = page - 1;
      setPage(prevPage);
      fetchFeedbacks(prevPage);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages) {
      setPage(pageNumber);
      fetchFeedbacks(pageNumber);
    }
  };

  const fetchFeedbacks = async (pageNumber: number = page) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://zipp-backend.vercel.app/api/feedbacks/${user?.id}?page=${pageNumber}&limit=${itemsPerPage}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      console.log(data);
      setFeedbacks(data.feedbacks || data); // Handle both paginated and non-paginated responses
      setTotalFeedbacks(data.total || data.length || 0);
      setExpandedFeedbackId(null); // Close any expanded rows
    } catch (err: any) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchFeedbacks();
    }
  }, [isSignedIn, user?.id]);

  const getDateStyle = () => {
    return "bg-gray-50 text-gray-700 border-gray-100";
  };

  const getRelativeTime = (date: string) => {
    const feedbackDate = new Date(date);
    const now = new Date();
    const diffTime = now.getTime() - feedbackDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else {
      return feedbackDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8 rounded-lg shadow-sm bg-white">
          <h2 className="text-2xl font-light text-gray-700 mb-2">
            Sign In Required
          </h2>
          <p className="text-gray-500 font-light">
            Please sign in to view the admin panel.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading feedbacks...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl font-light text-black mb-2">
                  Customer Feedbacks
                </h1>
                <p className="text-gray-600 text-lg">
                  View and manage customer feedback from your restaurant
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchFeedbacks()}
                  className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200 text-blue-700"
                  disabled={loading}
                >
                  <span>Refresh</span>
                </Button>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {totalFeedbacks} feedback
                    {totalFeedbacks !== 1 ? "s" : ""} total
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          {totalFeedbacks === 0 && !loading ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-blue-300 mx-auto mb-4" />
              <h3 className="text-2xl font-normal text-gray-800 mb-2">
                No feedback yet
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Customer feedback will appear here when they leave reviews about
                their dining experience.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 hover:bg-transparent">
                    <TableHead className="font-semibold text-gray-600 py-4 px-6">
                      Customer
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4 px-6">
                      Phone
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4">
                      Order #
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4">
                      Date
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4">
                      Feedback Preview
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 py-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedbacks.map((feedback: any, index: number) => (
                    <React.Fragment key={feedback.id}>
                      <TableRow
                        className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          index === feedbacks.length - 1 &&
                          expandedFeedbackId !== feedback.id
                            ? "border-b-0"
                            : ""
                        }`}
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-700 font-semibold text-sm">
                                {feedback.order?.firstName?.[0]?.toUpperCase() ||
                                  "?"}
                                {feedback.order?.lastName?.[0]?.toUpperCase() ||
                                  ""}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-800 font-semibold block">
                                {feedback.order?.firstName}{" "}
                                {feedback.order?.lastName}
                              </span>
                              <span className="text-gray-500 text-sm">
                                Customer
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-gray-800 font-semibold">
                            {feedback.phoneNumber ||
                              feedback.order?.phoneNumber}
                          </span>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1 rounded-full">
                            #{feedback.orderId}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex flex-col space-y-1">
                            <Badge
                              className={`${getDateStyle()} border font-medium px-3 py-1 rounded-full text-sm w-fit`}
                            >
                              {getRelativeTime(feedback.feedbackDate)}
                            </Badge>
                            <span className="text-gray-400 text-xs">
                              {new Date(
                                feedback.feedbackDate
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 max-w-xs">
                          <p className="text-gray-600 truncate">
                            {feedback.feedbackText.length > 60
                              ? `${feedback.feedbackText.substring(0, 60)}...`
                              : feedback.feedbackText}
                          </p>
                        </TableCell>
                        <TableCell className="py-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setExpandedFeedbackId(
                                expandedFeedbackId === feedback.id
                                  ? null
                                  : feedback.id
                              )
                            }
                            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 font-medium px-4"
                          >
                            {expandedFeedbackId === feedback.id ? (
                              <>
                                Hide <ChevronUp className="ml-1 w-4 h-4" />
                              </>
                            ) : (
                              <>
                                Details <ChevronDown className="ml-1 w-4 h-4" />
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedFeedbackId === feedback.id && (
                        <TableRow className="border-b border-gray-50">
                          <TableCell colSpan={6} className="py-0">
                            <div className="bg-gray-50/30 px-6 py-8 space-y-6">
                              <div>
                                <h4 className="text-lg font-medium text-black mb-4 flex items-center">
                                  Feedback Details
                                </h4>
                                <div className="bg-blue-50/30 border border-blue-100 rounded-xl p-6 shadow-sm">
                                  <p className="text-gray-800 leading-relaxed text-base">
                                    "{feedback.feedbackText}"
                                  </p>
                                </div>
                              </div>

                              {feedback.order && (
                                <div>
                                  <h4 className="text-lg font-medium text-black mb-4">
                                    Order Items
                                  </h4>
                                  <div className="space-y-3 mb-6">
                                    {feedback.order.orderItems?.map(
                                      (item: any, idx: number) => (
                                        <div
                                          key={idx}
                                          className="flex justify-between items-center py-3 px-4 bg-white border border-gray-100 rounded-lg"
                                        >
                                          <div className="flex flex-col">
                                            <span className="text-gray-800 font-medium">
                                              {item.name}
                                            </span>
                                            {item.category && (
                                              <span className="text-gray-500 text-sm">
                                                Category: {item.category}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center space-x-4 text-gray-500">
                                            <span>{item.price} MAD</span>
                                            <span>×</span>
                                            <span>{item.quantity}</span>
                                            <span className="text-gray-800 font-semibold min-w-[80px] text-right">
                                              {(
                                                item.price * item.quantity
                                              ).toFixed(2)}{" "}
                                              MAD
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}

                              {feedback.order && (
                                <div>
                                  <h4 className="text-lg font-medium text-black mb-4">
                                    Order Details
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                      <h5 className="text-sm font-medium text-blue-800 mb-1">
                                        Customer Info
                                      </h5>
                                      <p className="text-blue-700">
                                        {feedback.order.firstName}{" "}
                                        {feedback.order.lastName}
                                      </p>
                                      <p className="text-blue-600 text-sm">
                                        {feedback.order.phoneNumber}
                                      </p>
                                    </div>
                                    <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                                      <h5 className="text-sm font-medium text-green-800 mb-1">
                                        Order Total
                                      </h5>
                                      <p className="text-green-700 text-lg font-semibold">
                                        {feedback.order.totalAmount} MAD
                                      </p>
                                    </div>
                                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                      <h5 className="text-sm font-medium text-slate-800 mb-1">
                                        Table & Location
                                      </h5>
                                      <p className="text-slate-700">
                                        Table: {feedback.order.table || "-"}
                                      </p>
                                      <p className="text-slate-600 text-sm">
                                        Location: {feedback.order.location}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                  Feedback submitted on{" "}
                                  {new Date(
                                    feedback.feedbackDate
                                  ).toLocaleDateString("en-US", {
                                    weekday: "long",
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
                {totalFeedbacks > itemsPerPage && (
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={6} className="py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm text-gray-500">
                              Showing {startIndex + 1} to{" "}
                              {Math.min(
                                startIndex + itemsPerPage,
                                totalFeedbacks
                              )}{" "}
                              of {totalFeedbacks} feedbacks
                            </p>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToPrevPage}
                              disabled={page === 0}
                              className="flex items-center space-x-1 hover:bg-gray-50"
                            >
                              <ChevronLeft className="w-4 h-4" />
                              <span>Previous</span>
                            </Button>

                            <div className="flex items-center space-x-1">
                              {Array.from(
                                { length: Math.min(totalPages, 7) },
                                (_, i) => {
                                  let pageNumber;
                                  if (totalPages <= 7) {
                                    pageNumber = i;
                                  } else if (page < 3) {
                                    pageNumber = i;
                                  } else if (page >= totalPages - 3) {
                                    pageNumber = totalPages - 7 + i;
                                  } else {
                                    pageNumber = page - 3 + i;
                                  }

                                  return (
                                    <Button
                                      key={pageNumber}
                                      variant={
                                        page === pageNumber
                                          ? "default"
                                          : "outline"
                                      }
                                      size="sm"
                                      onClick={() => goToPage(pageNumber)}
                                      className={`w-8 h-8 p-0 ${
                                        page === pageNumber
                                          ? "bg-blue-600 text-white hover:bg-blue-700"
                                          : "hover:bg-gray-50"
                                      }`}
                                    >
                                      {pageNumber + 1}
                                    </Button>
                                  );
                                }
                              )}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={goToNextPage}
                              disabled={page === totalPages - 1}
                              className="flex items-center space-x-1 hover:bg-gray-50"
                            >
                              <span>Next</span>
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                )}
              </Table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Feedbacks;
