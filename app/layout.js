import "./globals.css";

export const metadata = {
  title: "OnAir Console",
  description: "楽天市場 × Shoplive ライブコマース連携ダッシュボード（デモ）",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
