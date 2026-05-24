import { ANALYZE_MODE_PROMPT } from "@oh-my-opencode/prompts-core"

/**
 * Analyze mode keyword detector.
 *
 * Triggers on analysis-related keywords across multiple languages:
 * - English: analyze, analyse, investigate, examine, research, deep-dive, inspect, audit, evaluate, assess, review, diagnose, scrutinize, dissect, debug, systematically
 * - Korean: 분석, 조사, 파악, 연구, 검토, 진단, 설명, 원인, 이유, 뜯어봐, 따져봐, 평가, 해석, 디버깅, 디버그, 살펴
 * - Japanese: 分析, 調査, 解析, 検討, 研究, 診断, 説明, 検証, 精査, 究明, デバッグ
 * - Chinese: 调查, 检查, 剖析, 深入, 诊断, 解释, 调试, 搞清楚, 弄明白
 * - Vietnamese: phân tích, điều tra, nghiên cứu, kiểm tra, xem xét, chẩn đoán, giải thích, tìm hiểu, gỡ lỗi
 */

export const ANALYZE_PATTERN =
  /\b(analyze|analyse|investigate|examine|research|deep[\s-]?dive|inspect|audit|evaluate|assess|review|diagnose|scrutinize|dissect|debug|systematically)\b|분석|조사|파악|연구|검토|진단|설명|원인|이유|뜯어봐|따져봐|평가|해석|디버깅|디버그|살펴|分析|調査|解析|検討|研究|診断|説明|検証|精査|究明|デバッグ|调查|检查|剖析|深入|诊断|解释|调试|搞清楚|弄明白|phân tích|điều tra|nghiên cứu|kiểm tra|xem xét|chẩn đoán|giải thích|tìm hiểu|gỡ lỗi/i

export const ANALYZE_MESSAGE = ANALYZE_MODE_PROMPT
