if (!/pnpm/.test(process.env.npm_execpath || '')) {
  console.warn(`\u001b[33m请使用pnpm进行依赖安装!!!`)
  process.exit(1)
}
