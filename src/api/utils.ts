/* eslint-disable ts/no-use-before-define */
export function createWebSocket<T>(url: (string | URL), protocols?: (string | string[])) {
  let ws: WebSocket

  let explicitlyClosed = false
  let onMessageCallback: (data: T) => void = () => {}

  const open = () => {
    if (explicitlyClosed) return self
    ws = new WebSocket(url, protocols)
    ws.onmessage = event => onMessageCallback(JSON.parse(event.data))
    ws.onclose = () => setTimeout(open, 1000)
    ws.onerror = () => setTimeout(open, 1000)
    return self
  }

  const close = () => {
    explicitlyClosed = true
    ws?.close(1000)
    return self
  }

  const onMessage = (callback: (data: T) => void) => {
    onMessageCallback = callback
    return self
  }

  const self = { open, close, onMessage }

  return self.open()
}
