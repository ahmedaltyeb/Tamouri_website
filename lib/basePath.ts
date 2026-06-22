// next/image with unoptimized:true does NOT apply basePath to local src.
// Use this prefix manually on every local <img> src.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export default BASE_PATH;
