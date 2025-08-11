export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ミドルウェアが認証チェックを行うので、ここでは追加のチェックは不要
  return <>{children}</>
}