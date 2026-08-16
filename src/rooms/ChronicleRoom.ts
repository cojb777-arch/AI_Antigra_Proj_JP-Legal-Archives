/* =========================================================
   ⏳ 3. CHRONICLE ROOM (年代記室: 法改正・新旧対照Diff)
   ========================================================= */

import * as Diff from 'diff';

interface LawAmendmentPreset {
  id: string;
  lawTitle: string;
  articleNum: string;
  amendmentYear: string;
  amendmentTitle: string;
  summary: string;
  oldText: string;
  newText: string;
}

const AMENDMENT_PRESETS: LawAmendmentPreset[] = [
  {
    id: 'minpo-709-saimu',
    lawTitle: '民法',
    articleNum: '第415条（債務不履行による損害賠償）',
    amendmentYear: '平成29年法律第44号（2020年4月施行）',
    amendmentTitle: '民法（債権関係）の大改正',
    summary: '「債務者の責めに帰すべき事由」という伝統的要件を、「契約その他の債務の発生原因及び取引上の社会通念に照らして債務者の責めに帰することができない事由」と明確化。履行不能の免責要件も整理されました。',
    oldText: `（債務不履行による損害賠償）
第四百十五条　債務者がその債務の本旨に従った履行をしないときは、債権者は、これによって生じた損害の賠償を請求することができる。債務者の責めに帰すべき事由によって履行をすることができなくなったときも、同様とする。`,
    newText: `（債務不履行による損害賠償）
第四百十五条　債務者がその債務の本旨に従った履行をしないとき又は債務の履行が不能であるときは、債権者は、これによって生じた損害の賠償を請求することができる。ただし、その債務の不履行が契約その他の債務の発生原因及び取引上の社会通念に照らして債務者の責めに帰することができない事由によるものであるときは、この限りでない。
２　前項の規定により損害賠償の請求をすることができる場合において、次の各号のいずれかに該当するときは、債権者は、履行の請求に代えて、損害賠償の請求をすることができる。
一　債務の履行が不能であるとき。
二　債務者がその債務の履行を拒絶する意思を明確に表示したとき。
三　債務が契約によって生じたものである場合において、その契約が解除され、又は債務の不履行による契約の解除権が発生したとき。`
  },
  {
    id: 'minpo-95-sakugo',
    lawTitle: '民法',
    articleNum: '第95条（錯誤）',
    amendmentYear: '平成29年法律第44号（2020年4月施行）',
    amendmentTitle: '錯誤の無効から取消しへの変更・動機の錯誤の明文化',
    summary: '従来の「無効」から「取消し」に変更され、判例上認められていた「動機の錯誤」が明文化されました。',
    oldText: `（錯誤）
第九十五条　意思表示は、法律行為の要素に錯誤があったときは、無効とする。ただし、表意者に重大な過失があったときは、表意者は、自らその無効を主張することができない。`,
    newText: `（錯誤）
第九十五条　意思表示は、次に掲げる錯誤に基づくものであって、その錯誤が法律行為の目的及び取引上の社会通念に照らして重要なものであるときは、取り消すことができる。
一　意思表示に対応する意思を欠く錯誤
二　表意者が法律行為の基礎とした事情についてのその認識が真実に反する錯誤
２　前項第二号の規定による意思表示の取消しは、その事情が法律行為の基礎とされていることが表示されていたときに限り、することができる。
３　錯誤が表意者の重大な過失によるものであった場合には、次に掲げる場合を除き、第一項の規定による意思表示の取消しをすることができない。
一　相手方が表意者に錯誤があることを知り、又は重大な過失によって知らなかったとき。
二　相手方が表意者と同一の錯誤に陥っていたとき。
４　第一項の規定による意思表示の取消しは、善意でかつ過失がない第三者に対抗することができない。`
  },
  {
    id: 'rouki-36-zangyou',
    lawTitle: '労働基準法',
    articleNum: '第36条（時間外及び休日の労働）',
    amendmentYear: '平成30年法律第71号（働き方改革関連法）',
    amendmentTitle: '残業時間の上限規制の導入',
    summary: '従来の限度基準告示から、法律上の罰則付き上限（原則月45時間・年360時間、特別条項付きでも年720時間等）へと大幅に強化されました。',
    oldText: `（時間外及び休日の労働）
第三十六条　使用者は、当該事業場に、労働者の過半数で組織する労働組合がある場合においてはその労働組合、労働者の過半数で組織する労働組合がない場合においては労働者の過半数を代表する者との書面による協定をし、これを行政官庁に届け出たときは、第三十二条から第三十二条の五まで若しくは第四十条の労働時間又は前条の休日に関する規定にかかわらず、その協定で定めるところによって労働時間を延長し、又は休日に労働させることができる。`,
    newText: `（時間外及び休日の労働）
第三十六条　使用者は、当該事業場に、労働者の過半数で組織する労働組合がある場合においてはその労働組合、労働者の過半数で組織する労働組合がない場合においては労働者の過半数を代表する者との書面による協定をし、厚生労働省令で定めるところによりこれを行政官庁に届け出たときは、第三十二条から第三十二条の五まで若しくは第四十条の労働時間又は前条の休日に関する規定にかかわらず、その協定で定めるところによって労働時間を延長し、又は休日に労働させることができる。
２　前項の協定においては、次に掲げる事項を定めるものとする。
一　この条の規定により労働時間を延長し、又は休日に労働させることができることとされる労働者の範囲
二　対象期間
三　労働時間を延長し、又は休日に労働させることができる場合
四　対象期間における一日、一箇月及び一年のそれぞれの期間について労働時間を延長して労働させることができる時間又は労働させることができる休日の日数
...（罰則付き上限規定の追加）`
  }
];

export class ChronicleRoom {
  private container: HTMLElement;
  private currentPreset: LawAmendmentPreset = AMENDMENT_PRESETS[0];

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
  }

  public render(): void {
    this.container.innerHTML = `
      <div class="room-header">
        <div class="room-title-group">
          <span class="room-tag">THE CHRONICLE & DIFF ARCHIVES</span>
          <h2 class="room-title">⏳ 年代記室 <span style="font-size: 14px; font-weight: normal; color: var(--color-brass-dark);">〜 法改正履歴 ＆ 赤黒新旧対照Diff 〜</span></h2>
          <p class="room-desc">明治・大正・昭和・平成・令和と受け継がれてきた法令の変遷を辿ります。大改正前後の条文を比較し、何が削除され、何が加わったかを視覚的に解明します。</p>
        </div>
      </div>

      <div class="chronicle-layout">
        <!-- 改正事例セレクター -->
        <div class="chronicle-controls">
          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--color-oxford-blue); display: block; margin-bottom: 4px;">
              📜 歴代の重要法改正アーカイブを選択:
            </label>
            <select id="select-amendment-preset" class="select-classic" style="width: 100%;">
              ${AMENDMENT_PRESETS.map((p, idx) => `
                <option value="${idx}">${p.lawTitle} ${p.articleNum} 【${p.amendmentTitle}】</option>
              `).join('')}
            </select>
          </div>

          <div>
            <label style="font-size: 11px; font-weight: 700; color: var(--color-oxford-blue); display: block; margin-bottom: 4px;">
              比較モード:
            </label>
            <select id="select-diff-mode" class="select-classic" style="width: 100%;">
              <option value="split">左右並列比較 (Split)</option>
              <option value="inline">行内ハイライト (Inline)</option>
            </select>
          </div>

          <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 8px;">
            <button id="btn-custom-diff" class="btn-outline-classic">
              ✍️ 任意の条文を直接入力して比較
            </button>
          </div>
        </div>

        <!-- Diffレンダリング領域 -->
        <div class="chronicle-diff-view" id="diff-output-container"></div>
      </div>
    `;

    this.attachEvents();
    this.renderDiff();
  }

  private attachEvents(): void {
    const selectPreset = document.getElementById('select-amendment-preset') as HTMLSelectElement;
    const selectMode = document.getElementById('select-diff-mode') as HTMLSelectElement;
    const customBtn = document.getElementById('btn-custom-diff');

    selectPreset?.addEventListener('change', () => {
      const idx = parseInt(selectPreset.value, 10);
      this.currentPreset = AMENDMENT_PRESETS[idx];
      this.renderDiff();
    });

    selectMode?.addEventListener('change', () => {
      this.renderDiff();
    });

    customBtn?.addEventListener('click', () => {
      const oldText = prompt('比較元（改正前・現行）の条文テキストを入力してください:', this.currentPreset.oldText);
      if (oldText !== null) {
        const newText = prompt('比較先（改正後・新案）の条文テキストを入力してください:', this.currentPreset.newText);
        if (newText !== null) {
          this.currentPreset = {
            id: 'custom',
            lawTitle: '任意比較',
            articleNum: '入力条文',
            amendmentYear: 'ユーザー指定',
            amendmentTitle: '条文差分比較',
            summary: '指定されたテキスト同士の差分です。',
            oldText,
            newText
          };
          this.renderDiff();
        }
      }
    });
  }

  private renderDiff(): void {
    const container = document.getElementById('diff-output-container');
    const modeSelect = document.getElementById('select-diff-mode') as HTMLSelectElement;
    const mode = modeSelect ? modeSelect.value : 'split';
    if (!container) return;

    const diffParts = Diff.diffWordsWithSpace(this.currentPreset.oldText, this.currentPreset.newText);

    // 左右並列表示用のHTML構築
    let oldHtml = '';
    let newHtml = '';
    let inlineHtml = '';

    diffParts.forEach(part => {
      if (part.added) {
        newHtml += `<span class="diff-inserted">${part.value}</span>`;
        inlineHtml += `<span class="diff-inserted">${part.value}</span>`;
      } else if (part.removed) {
        oldHtml += `<span class="diff-deleted">${part.value}</span>`;
        inlineHtml += `<span class="diff-deleted">${part.value}</span>`;
      } else {
        oldHtml += part.value;
        newHtml += part.value;
        inlineHtml += part.value;
      }
    });

    container.innerHTML = `
      <div style="margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid var(--border-antique);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 17px; font-weight: 700; color: var(--color-oxford-blue);">
            📜 ${this.currentPreset.lawTitle} ${this.currentPreset.articleNum}
          </h3>
          <span class="badge-law-type law">${this.currentPreset.amendmentYear}</span>
        </div>
        <p style="font-size: 13px; color: var(--text-sepia); margin-top: 6px;">
          💡 <strong>改正の要点:</strong> ${this.currentPreset.summary}
        </p>
      </div>

      ${mode === 'split' ? `
        <div class="diff-header-bar">
          <div class="diff-col-title old">
            <span>🟥 改正前（旧条文 / 削除部分）</span>
          </div>
          <div class="diff-col-title new">
            <span>🟩 改正後（現行新条文 / 追加部分）</span>
          </div>
        </div>

        <div class="diff-body-split">
          <div class="diff-side-box">${oldHtml}</div>
          <div class="diff-side-box">${newHtml}</div>
        </div>
      ` : `
        <div class="diff-side-box" style="line-height: 2;">${inlineHtml}</div>
      `}
    `;
  }
}
