export interface SuggestRequest {
  keywords: string[]
  count?: number
}

export interface DomainSuggestion {
  domain: string
  available: boolean
  reason: string
  tld: string
}

export interface SuggestResponse {
  suggestions: DomainSuggestion[]
  registered: DomainSuggestion[]
  keywords: string[]
}

export interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string
    }
  }>
}

export interface DeepSeekDomainItem {
  domain: string
  reason: string
  tld: string
}
