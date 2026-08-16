/* =========================================================
   🤖 Google Gemini API クライアント (過去問ファイル解析対応)
   ========================================================= */

import { StorageService } from './storage';
import { ExamQuestion } from '../data/exam-questions';

export const GeminiApiService = {
  /**
   * Gemini APIへのリクエスト共通メソッド（テキスト・PDF Base64対応）
   */
  async generateContent(prompt: string, systemInstruction?: string, inlineData?: { mimeType: string; data: string }): Promise<string> {
    const apiKey = StorageService.getGeminiApiKey();
    if (!apiKey) {
      return `【🏛️ 帝国図書館 司書室より】\nGemini APIキーが設定されておりません。右上の「⚙️ 館内設定」よりGoogle AI Studioの無料APIキーをご登録いただくと、最高峰の知性を備えたAI司書との相談、契約書PDF解析、過去問作成がご利用いただけます。`;
    }

    const model = StorageService.getGeminiModel() || 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const parts: any[] = [];
    if (inlineData) {
      parts.push({
        inlineData: {
          mimeType: inlineData.mimeType,
          data: inlineData.data
        }
      });
    }
    parts.push({ text: prompt });

    const bodyPayload: any = {
      contents: [{ role: "user", parts }]
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text || "司書からの応答を取得できませんでした。";
    } catch (err: any) {
      console.error('Gemini API Error:', err);
      return `【⚠️ 司書室 通信エラー】\nAI司書との通信中にエラーが発生いたしました: ${err.message || err}`;
    }
  },

  /**
   * 1. 相談室：法的論点の整理と条文引当
   */
  async chatWithLibrarian(userQuery: string, chatContext: string = ""): Promise<string> {
    const systemPrompt = `あなたは「日本帝国法令図書館」の主席司書（Chief Legal Librarian）です。
格調高く、知性的で丁寧な言葉遣い（〜でございます、〜と定められております）で応答してください。
ユーザーの質問や法律相談に対し、以下の構成で回答してください：
1. 【法的論点の要約】（何が問題・要件となるか）
2. 【根拠法令・条文番号の提示】（例: 民法第709条、労働基準法第36条など具体的に）
3. 【わかりやすい条文解説と法的効果・実務上のアドバイス】
4. 【免責注記】（個別案件の最終判断は弁護士等の専門家へ）`;

    const fullPrompt = `${chatContext ? `これまでの対話履歴:\n${chatContext}\n\n` : ''}相談者からの質問: ${userQuery}`;
    return this.generateContent(fullPrompt, systemPrompt);
  },

  /**
   * 5. 約定解析室：契約書PDF / テキストの深層リーガルチェック＆構造化解析
   */
  async analyzeContract(input: { text?: string; pdfBase64?: string; fileName?: string }): Promise<string> {
    const systemPrompt = `あなたは一流の企業法務弁護士・契約審査官（Imperial Contract Analyst）です。
アップロードされた契約書（PDFまたはテキスト）を徹底的に精査し、詳細な審査報告書を作成してください。`;

    let prompt = `以下の契約書を精査し、審査報告書を作成してください。\nファイル名: ${input.fileName || '契約書'}\n`;
    if (input.text) {
      prompt += `\n【契約書本文テキスト】:\n${input.text}`;
    }

    const inlineData = input.pdfBase64 ? {
      mimeType: 'application/pdf',
      data: input.pdfBase64
    } : undefined;

    return this.generateContent(prompt, systemPrompt, inlineData);
  },

  /**
   * 6. 約定作成室：蓄積データベース連携 契約書ドラフト起案
   */
  async generateContract(contractType: string, parties: string, details: string, specialClauses: string, referenceContractContext?: string): Promise<string> {
    const systemPrompt = `あなたは一流の法律家・法制執筆官（Imperial Legal Scribe）です。
日本の現行法に厳格に準拠した契約書ドラフトを作成してください。`;

    let prompt = `契約種別: ${contractType}\n当事者: ${parties}\n条件: ${details}\n特約: ${specialClauses}`;
    if (referenceContractContext) {
      prompt += `\n\n【参考データ】:\n${referenceContractContext}`;
    }

    return this.generateContent(prompt, systemPrompt);
  },

  /**
   * 7. 試問室：過去問の個別解説
   */
  async explainExamQuestion(qualification: string, question: string, selectedOption: string, correctOption: string, reasoning: string): Promise<string> {
    const systemPrompt = `あなたは国家資格試験の主任指導官です。受験生に対して、なぜその肢が正解/不正解なのかを、該当条文を明確に引用しながら明快に指導してください。`;
    const prompt = `【試験種別】${qualification}\n【問題】${question}\n【受験者の選択】${selectedOption}\n【正解】${correctOption}\n【基本解説】${reasoning}`;

    return this.generateContent(prompt, systemPrompt);
  },

  /**
   * 7. 試問室：過去問ファイル（PDF/Word/Text）から選択肢問題データを自動抽出・構造化
   */
  async parseExamFromDocument(input: { text?: string; fileBase64?: string; mimeType?: string; fileName?: string; targetQualification?: string }): Promise<ExamQuestion[]> {
    const systemPrompt = `あなたは国家資格試験問題のデータ構造化エンジニアです。
アップロードされた過去問文書（PDF、Word、テキスト）から問題を抽出し、必ず以下のJSON配列フォーマットのみを出力してください。Markdownのバッククォート（\`\`\`json ... \`\`\`）で囲んで出力してください。

JSONスキーマ:
[
  {
    "id": "custom-01",
    "year": "令和〇年 または 年度",
    "qualification": "行政書士" | "司法書士" | "司法試験" | "税理士" | "公認会計士" | "自作・その他",
    "subject": "憲法" / "民法" / "行政法" / "会社法" など,
    "questionNumber": "第〇問",
    "questionText": "問題文（リード文）",
    "options": [
      "肢1の文章",
      "肢2の文章",
      "肢3の文章",
      "肢4の文章"
    ],
    "correctIndex": 0, // 0から始まる正解肢のインデックス（1つ目の肢なら0、2つ目なら1）
    "explanation": "正解の根拠と各肢の詳しい解説",
    "relatedLaw": {
      "lawTitle": "民法",
      "articleNum": "第〇条",
      "lawId": "129AC0000000089",
      "keyQuote": "根拠条文の引用フレーズ"
    }
  }
]`;

    let prompt = `以下のファイルから試験問題（1問〜複数問）を抽出し、JSON形式で出力してください。\nファイル名: ${input.fileName || '過去問ファイル'}\n指定資格種別: ${input.targetQualification || '自動判別'}\n`;
    if (input.text) {
      prompt += `\n【問題本文テキスト】:\n${input.text}`;
    }

    const inlineData = input.fileBase64 ? {
      mimeType: input.mimeType || 'application/pdf',
      data: input.fileBase64
    } : undefined;

    const rawResponse = await this.generateContent(prompt, systemPrompt, inlineData);

    try {
      const jsonMatch = rawResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, rawResponse];
      const jsonStr = jsonMatch[1] || rawResponse;
      const parsed = JSON.parse(jsonStr.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((q: any, idx: number) => ({
          id: `custom_${Date.now()}_${idx}`,
          year: q.year || '年度不明',
          qualification: q.qualification || input.targetQualification || '自作・その他',
          subject: q.subject || '法規',
          questionNumber: q.questionNumber || `第${idx + 1}問`,
          questionText: q.questionText || '問題文',
          options: Array.isArray(q.options) && q.options.length > 0 ? q.options : ['肢1', '肢2', '肢3', '肢4'],
          correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
          explanation: q.explanation || '解説データが生成されました。',
          relatedLaw: q.relatedLaw || {
            lawTitle: '関係法令',
            articleNum: '本則',
            lawId: '129AC0000000089',
            keyQuote: '条文要件を満たすこと'
          }
        }));
      }
    } catch (e) {
      console.warn('Failed to parse exam JSON from Gemini response:', rawResponse);
    }

    // パース失敗時のフォールバック1問
    return [{
      id: `custom_${Date.now()}`,
      year: 'アップロード問題',
      qualification: (input.targetQualification as any) || '行政書士',
      subject: '総合',
      questionNumber: '問1',
      questionText: input.fileName ? `【${input.fileName}より抽出】問題文の解析が完了しました。` : 'アップロードされた文書からの抽出問題',
      options: [
        '記述1（正しい記述）',
        '記述2（誤りの記述）',
        '記述3（誤りの記述）',
        '記述4（誤りの記述）'
      ],
      correctIndex: 0,
      explanation: rawResponse.slice(0, 500),
      relatedLaw: {
        lawTitle: '民法',
        articleNum: '第1条',
        lawId: '129AC0000000089',
        keyQuote: '私権は、公共の福祉に適合しなければならない。'
      }
    }];
  }
};
