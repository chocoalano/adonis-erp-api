async function loadApp() {
  await import('./build/bin/server.js')
}
loadApp()
