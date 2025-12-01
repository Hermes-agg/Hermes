interface RpcRequest {
  jsonrpc: string
  id: number
  method: string
  params: any[]
}

interface RpcResponse<T = any> {
  jsonrpc: string
  id: number
  result?: T
  error?: any
}

const TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

export async function rpcRequest<T = any>(rpc: string, method: string, params: any[]): Promise<T> {
  const body: RpcRequest = { jsonrpc: '2.0', id: 1, method, params }
  const res = await fetch(rpc, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json: RpcResponse<T> = await res.json()
  if (json.error) throw new Error(JSON.stringify(json.error))
  return json.result as T
}

export async function fetchSolBalance(address: string, rpc: string) {
  const lamports = await rpcRequest<number>(rpc, 'getBalance', [address])
  return lamports / 1e9
}

// returns array of token balances with decimals and uiAmount
export async function fetchTokenAccounts(address: string, rpc: string) {
  // use getTokenAccountsByOwner with parsed data
  const result = await rpcRequest<any>(rpc, 'getTokenAccountsByOwner', [address, { programId: TOKEN_PROGRAM_ID }, { encoding: 'jsonParsed' }])
  const value = result?.value || []
  const tokens = value.map((item: any) => {
    const parsed = item.account?.data?.parsed?.info
    const mint = parsed?.mint
    const amountInfo = parsed?.tokenAmount || {}
    const uiAmount = amountInfo.uiAmount || 0
    const decimals = amountInfo.decimals || 0
    return {
      mint,
      amount: Number(amountInfo.amount || 0),
      uiAmount,
      decimals,
    }
  })
  return tokens
}
