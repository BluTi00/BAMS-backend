import { Cluster } from 'puppeteer-cluster'

// Global cluster (init once)
let cluster: Cluster | null = null

export const initPuppeteerCluster = async () => {
  if (!cluster) {
    cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_CONTEXT, // New context per task (safer for isolation)
      maxConcurrency: 3, // Adjust based on CPU cores (e.g., 4 for a strong machine)
      puppeteerOptions: {
        headless: true,
      },
      monitor: true, // Logs usage/stats (optional, for debugging)
      timeout: 120000, // Per-task timeout
      retryLimit: 2,
      retryDelay: 1000,
    })
  }
  return cluster
}

// Shutdown on app exit (e.g., in process.on('SIGINT'))
export const closePuppeteerCluster = async () => {
  if (cluster) {
    await cluster.close()
    cluster = null
  }
}
