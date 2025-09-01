import { Layout } from "@/components/Layout";
import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  ShoppingCart,
  Clock,
  DollarSign,
  Download,
  Star,
  TrendingDown,
} from "lucide-react";
import axios from "axios";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { format, subDays } from "date-fns";
import { useUser } from "@clerk/clerk-react";

interface AnalyticsData {
  numOfOrders: number;
  loyalCustomers: Array<{
    phoneNumber: string;
    _count: { phoneNumber: number };
  }>;
  mostOrdered: Array<{
    itemId: string;
    itemName: string;
    orderCount: number;
    price: number;
  }>;
  leastOrdered: Array<{
    itemId: string;
    itemName: string;
    orderCount: number;
    price: number;
  }>;
  averageOrderValue: number;
  peakOrderTimes: Array<{
    hour: number;
    orderCount: number;
    timeRange: string;
  }>;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(
    format(subDays(new Date(), 30), "yyyy-MM-dd")
  );
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { isSignedIn, user } = useUser()
  const restaurantId = user?.id
  const API_BASE = "https://zipp-backend.vercel.app/api/analytics"

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/${restaurantId}/${startDate}/${endDate}`
      );

      if (response.data.success) {
        const [
          numOfOrders,
          loyalCustomers,
          mostOrdered,
          [leastOrdered, averageOrderValue, peakOrderTimes],
        ] = response.data.data;
        setAnalyticsData({
          numOfOrders,
          loyalCustomers,
          mostOrdered,
          leastOrdered,
          averageOrderValue,
          peakOrderTimes,
        });
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSignedIn && user?.id) {
      fetchAnalytics()
    }
  }, [isSignedIn, user])

  if (!isSignedIn) {
    return <div>Sign in to view this page</div>
  }

  const downloadSimplePDF = () => {
    if (!analyticsData) return;

    const pdf = new jsPDF("p", "mm", "a4");
    const margin = 20;
    let y = margin;

    // Title
    pdf.setFontSize(20);
    pdf.text("Analytics Report", margin, y);
    y += 15;

    // Date range
    pdf.setFontSize(12);
    pdf.text(
      `Period: ${format(new Date(startDate), "MMM dd, yyyy")} - ${format(
        new Date(endDate),
        "MMM dd, yyyy"
      )}`,
      margin,
      y
    );
    y += 15;

    // Key metrics
    pdf.setFontSize(16);
    pdf.text("Key Metrics", margin, y);
    y += 10;

    pdf.setFontSize(12);
    pdf.text(`Total Orders: ${analyticsData.numOfOrders}`, margin, y);
    y += 8;
    pdf.text(
      `Average Order Value: $${Number(analyticsData.averageOrderValue).toFixed(
        2
      )}`,
      margin,
      y
    );
    y += 8;
    pdf.text(
      `Loyal Customers: ${analyticsData.loyalCustomers.length}`,
      margin,
      y
    );
    y += 15;

    // Most ordered items
    pdf.setFontSize(16);
    pdf.text("Top Selling Items", margin, y);
    y += 10;

    pdf.setFontSize(12);
    analyticsData.mostOrdered.slice(0, 10).forEach((item, index) => {
      if (y > 250) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(
        `${index + 1}. ${item.itemName} - ${item.orderCount} orders ($${
          item.price
        })`,
        margin,
        y
      );
      y += 8;
    });

    y += 10;

    // Loyal customers
    pdf.setFontSize(16);
    pdf.text("Loyal Customers", margin, y);
    y += 10;

    pdf.setFontSize(12);
    analyticsData.loyalCustomers.forEach((customer) => {
      if (y > 250) {
        pdf.addPage();
        y = margin;
      }
      pdf.text(
        `${customer.phoneNumber} - ${customer._count.phoneNumber} orders`,
        margin,
        y
      );
      y += 8;
    });

    pdf.save(`analytics-report-simple-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const downloadPDF = async () => {
    if (!dashboardRef.current) return;

    try {
      // Create a temporary clone of the element to avoid oklch color issues
      const element = dashboardRef.current;
      const clone = element.cloneNode(true) as HTMLElement;

      // Apply styles to ensure proper rendering
      clone.style.position = "absolute";
      clone.style.top = "-9999px";
      clone.style.left = "-9999px";
      clone.style.width = element.offsetWidth + "px";
      clone.style.height = element.offsetHeight + "px";
      clone.style.background = "#ffffff";

      // Replace oklch colors with hex equivalents
      const replaceOklchColors = (elem: HTMLElement) => {
        const walker = document.createTreeWalker(
          elem,
          NodeFilter.SHOW_ELEMENT,
          null
        );

        let node;
        while ((node = walker.nextNode())) {
          const element = node as HTMLElement;

          // Force specific background colors for common elements
          if (
            element.classList.contains("bg-background") ||
            element.classList.contains("bg-card")
          ) {
            element.style.backgroundColor = "#ffffff";
          }
          if (element.classList.contains("bg-primary")) {
            element.style.backgroundColor = "#0f172a";
          }
          if (element.classList.contains("bg-secondary")) {
            element.style.backgroundColor = "#f1f5f9";
          }
          if (element.classList.contains("text-primary")) {
            element.style.color = "#0f172a";
          }
          if (element.classList.contains("text-muted-foreground")) {
            element.style.color = "#64748b";
          }
        }
      };

      document.body.appendChild(clone);
      replaceOklchColors(clone);

      const canvas = await html2canvas(clone, {
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        removeContainer: true,
        logging: false,
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return (
            element.classList.contains("fixed") ||
            element.classList.contains("sticky")
          );
        },
      });

      // Remove the clone
      document.body.removeChild(clone);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`analytics-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      // Fallback to simple PDF
      downloadSimplePDF();
    }
  };
  const StatCard = ({ title, value, icon: Icon, trend, description }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <p className="text-xs text-muted-foreground">
            <span className={trend > 0 ? "text-green-600" : "text-red-600"}>
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (!analyticsData && !loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <p>No analytics data available</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6" ref={dashboardRef}>
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Restaurant insights from{" "}
              {format(new Date(startDate), "MMM dd, yyyy")} to{" "}
              {format(new Date(endDate), "MMM dd, yyyy")}
            </p>
          </div>
          {/* Date Range Selector */}
          <div className="">
            <CardContent className="flex gap-4 items-end">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <Button onClick={fetchAnalytics} disabled={loading}>
                {loading ? "Loading..." : "Update"}
              </Button>
              <div className="flex gap-4">
            <Button onClick={downloadPDF} variant="outline">
              <Download className="h-4 w-4 " />
               Download Report
            </Button>
          </div>
            </CardContent>
          </div>
        </div>

       
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          </div>
        ) : (
          analyticsData && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Orders"
                  value={analyticsData.numOfOrders}
                  icon={ShoppingCart}
                  description=" from last period"
                />
                <StatCard
                  title="Average Order Value"
                  value={`$${Number(analyticsData.averageOrderValue).toFixed(
                    2
                  )}`}
                  icon={DollarSign}
                  description=" average per order"
                />
                <StatCard
                  title="Loyal Customers"
                  value={analyticsData.loyalCustomers.length}
                  icon={Users}
                  description=" repeat customers"
                />
                <StatCard
                  title="Peak Hours"
                  value={analyticsData.peakOrderTimes.length}
                  icon={Clock}
                  description=" identified"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Peak Order Times */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5" />
                      Peak Order Times
                    </CardTitle>
                    <CardDescription>Orders by hour of the day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={analyticsData.peakOrderTimes}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="timeRange" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="orderCount" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Most Ordered Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Top Selling Items
                    </CardTitle>
                    <CardDescription>Most popular menu items</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={analyticsData.mostOrdered.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ itemName, percent }: any) =>
                            `${itemName} ${
                              percent ? (percent * 100).toFixed(0) : 0
                            }%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="orderCount"
                        >
                          {analyticsData.mostOrdered
                            .slice(0, 5)
                            .map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Most Ordered Items Detailed List */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Best Selling Items
                    </CardTitle>
                    <CardDescription>
                      Complete list of popular items
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.mostOrdered.slice(0, 5).map((item) => (
                        <div
                          key={item.itemId}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {item.orderCount} orders
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Least Ordered Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5" />
                      Underperforming Items
                    </CardTitle>
                    <CardDescription>Items that need attention</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.leastOrdered.slice(0, 5).map((item) => (
                        <div
                          key={item.itemId}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {item.orderCount} orders
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Loyal Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Loyal Customers
                  </CardTitle>
                  <CardDescription>
                    Customers with multiple orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.loyalCustomers.map((customer) => (
                      <div
                        key={customer.phoneNumber}
                        className="flex justify-between items-center"
                      >
                        <div>
                          <p className="font-medium">{customer.phoneNumber}</p>
                        </div>
                        <Badge variant="secondary">
                          {customer._count.phoneNumber} orders
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )
        )}
      </div>
    </Layout>
  );
}

export default Analytics;
