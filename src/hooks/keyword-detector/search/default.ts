import { SEARCH_MODE_PROMPT } from "@oh-my-opencode/prompts-core"

/**
 * Search mode keyword detector.
 *
 * Triggers on search-related keywords across multiple languages:
 * - English: search, find, locate, lookup, explore, discover, scan, grep, query, browse, trace, seek, track, pinpoint
 * - Korean: 검색, 찾아, 탐색, 조회, 스캔, 서치, 뒤져, 찾기, 추적, 탐지, 찾아봐, 찾아내
 * - Japanese: 検索, 探して, 見つけて, サーチ, 探索, スキャン, 発見, 捜索, 見つけ出す
 * - Chinese: 搜索, 查找, 寻找, 查询, 检索, 定位, 扫描, 发现, 找出来
 * - Vietnamese: tìm kiếm, tra cứu, định vị, quét, phát hiện, truy tìm, tìm ra
 */

export const SEARCH_PATTERN =
  /\b(search|find|locate|lookup|look\s*up|explore|discover|scan|grep|query|browse|trace|seek|track|pinpoint)\b|검색|찾아|탐색|조회|스캔|서치|뒤져|찾기|추적|탐지|찾아봐|찾아내|検索|探して|見つけて|サーチ|探索|スキャン|発見|捜索|見つけ出す|搜索|查找|寻找|查询|检索|定位|扫描|发现|找出来|tìm kiếm|tra cứu|định vị|quét|phát hiện|truy tìm|tìm ra/i

export const SEARCH_MESSAGE = SEARCH_MODE_PROMPT
