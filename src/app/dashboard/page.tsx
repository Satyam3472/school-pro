'use client'
import { useEffect } from "react";
import { useDashboardNav } from "./layout";
import { 
  CalendarCheck, 
  TrendingDown, 
  TrendingUp, 
  Users, 
  DollarSign, 
  PieChart, 
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Line, LineChart, Bar, BarChart, PieChart as RechartsPieChart, Pie, Cell, Area, AreaChart } from "recharts";
import AdmissionForm from "./admissions/page";

// Dummy data for charts
const monthlyData = [
  { month: "Jan", income: 45000, expenses: 12000, attendance: 1180 },
  { month: "Feb", income: 48000, expenses: 13500, attendance: 1195 },
  { month: "Mar", income: 52000, expenses: 14200, attendance: 1210 },
  { month: "Apr", income: 49000, expenses: 12800, attendance: 1205 },
  { month: "May", income: 55000, expenses: 15000, attendance: 1220 },
  { month: "Jun", income: 58000, expenses: 16000, attendance: 1230 },
  { month: "Jul", income: 52000, expenses: 14500, attendance: 1215 },
  { month: "Aug", income: 54000, expenses: 13800, attendance: 1225 },
  { month: "Sep", income: 56000, expenses: 15200, attendance: 1235 },
  { month: "Oct", income: 59000, expenses: 15800, attendance: 1240 },
  { month: "Nov", income: 61000, expenses: 16500, attendance: 1245 },
  { month: "Dec", income: 65000, expenses: 18000, attendance: 1250 },
];

const feeCollectionData = [
  { status: "Paid", value: 75, color: "#10b981" },
  { status: "Pending", value: 15, color: "#f59e0b" },
  { status: "Overdue", value: 10, color: "#ef4444" },
];

const expenseBreakdown = [
  { category: "Salaries", amount: 45000, color: "#3b82f6" },
  { category: "Utilities", amount: 12000, color: "#10b981" },
  { category: "Supplies", amount: 8000, color: "#f59e0b" },
  { category: "Maintenance", amount: 6000, color: "#8b5cf6" },
  { category: "Other", amount: 4000, color: "#ef4444" },
];

const attendanceData = [
  { day: "Mon", present: 1180, absent: 65 },
  { day: "Tue", present: 1195, absent: 50 },
  { day: "Wed", present: 1205, absent: 40 },
  { day: "Thu", present: 1210, absent: 35 },
  { day: "Fri", present: 1220, absent: 25 },
];

const chartConfig = {
  income: {
    label: "Income",
    color: "#10b981",
  },
  expenses: {
    label: "Expenses", 
    color: "#ef4444",
  },
  present: {
    label: "Present",
    color: "#10b981",
  },
  absent: {
    label: "Absent",
    color: "#ef4444", 
  },
};

export default function Dashboard() {
  const { setBreadcrumb, setPageTitle } = useDashboardNav();
  
  useEffect(() => {
    setBreadcrumb([
      { label: "Dashboard", href: "/dashboard" },
      { label: "Overview" },
    ]);
    setPageTitle("Overview");
  }, [setBreadcrumb, setPageTitle]);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header Stats - Compact Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm py-2">
          <CardContent className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">1,245</p>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12% from last month
                </div>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm py-2">
          <CardContent className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Today's Attendance</p>
                <p className="text-2xl font-bold">1,020</p>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  98.2% attendance rate
                </div>
              </div>
              <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg">
                <CalendarCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm py-2">
          <CardContent className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600">₹65,000</p>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +15.3% from last month
                </div>
              </div>
              <div className="bg-emerald-100 dark:bg-emerald-900/20 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm py-2">
          <CardContent className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Monthly Expense</p>
                <p className="text-2xl font-bold text-red-600">₹18,000</p>
                <div className="flex items-center text-xs text-red-600">
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                  +8.2% from last month
                </div>
              </div>
              <div className="bg-rose-100 dark:bg-rose-900/20 p-3 rounded-lg">
                <TrendingDown className="w-6 h-6 text-rose-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Financial Trend - Takes 2 columns */}
        {/* <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Financial Performance
            </CardTitle>
            <CardDescription>Monthly income vs expenses trend</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="income" 
                  stroke="#10b981" 
                  fill="url(#incomeGradient)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#ef4444" 
                  fill="url(#expenseGradient)"
                  strokeWidth={2}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card> */}
        <Card className="lg:col-span-2 shadow-sm  py-0">
          <CardContent>
            <AdmissionForm />
          </CardContent>
        </Card>

        {/* Fee Collection Status */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              Fee Collection
            </CardTitle>
            <CardDescription>Current payment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <RechartsPieChart width={200} height={200}>
                <Pie
                  data={feeCollectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feeCollectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </RechartsPieChart>
            </div>
            <div className="mt-4 space-y-2">
              {feeCollectionData.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.status}</span>
                  </div>
                  <span className="font-medium">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Attendance */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
              Weekly Attendance
            </CardTitle>
            <CardDescription>Present vs absent students</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={attendanceData}>
                <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="w-5 h-5 text-purple-600" />
              Expense Breakdown
            </CardTitle>
            <CardDescription>Monthly expenses by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <RechartsPieChart width={200} height={200}>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="amount"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip />
              </RechartsPieChart>
            </div>
            <div className="mt-4 space-y-2">
              {expenseBreakdown.map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-muted-foreground">{item.category}</span>
                  </div>
                  <span className="font-medium">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Student Growth</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium text-green-600">+15</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Year</span>
                <span className="font-medium text-green-600">+89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium">Revenue Growth</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium text-green-600">+12.5%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Year</span>
                <span className="font-medium text-green-600">+28.3%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CalendarCheck className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Attendance Rate</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Week</span>
                <span className="font-medium">98.2%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">97.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 