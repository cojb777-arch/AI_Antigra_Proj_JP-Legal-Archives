/* =========================================================
   🏛️ 収載法令マスターデータ（全101法令）
   ========================================================= */

export interface MasterLawItem {
  no: number;
  title: string;
  category: '公法・憲法' | '行政・社会' | '民法・民事' | '商法・会社' | '刑事法' | '労働・知財' | '国際条約';
  query: string;
  type: string;
}

export const MASTER_LAWS_101: MasterLawItem[] = [
  // 公法・憲法・統治 (1〜20)
  { no: 1, title: "法の適用に関する通則法", category: "公法・憲法", query: "法の適用に関する通則法", type: "法律" },
  { no: 2, title: "日本国憲法", category: "公法・憲法", query: "日本国憲法", type: "憲法" },
  { no: 3, title: "大日本帝国憲法", category: "公法・憲法", query: "大日本帝国憲法", type: "憲法" },
  { no: 4, title: "国民投票法", category: "公法・憲法", query: "日本国憲法の改正手続に関する法律", type: "法律" },
  { no: 5, title: "皇室典範", category: "公法・憲法", query: "皇室典範", type: "法律" },
  { no: 6, title: "国旗及び国歌に関する法律", category: "公法・憲法", query: "国旗及び国歌に関する法律", type: "法律" },
  { no: 7, title: "国籍法", category: "公法・憲法", query: "国籍法", type: "法律" },
  { no: 8, title: "請願法", category: "公法・憲法", query: "請願法", type: "法律" },
  { no: 9, title: "国会法", category: "公法・憲法", query: "国会法", type: "法律" },
  { no: 10, title: "議院証言法", category: "公法・憲法", query: "議院における証人の宣誓及び証言等に関する法律", type: "法律" },
  { no: 11, title: "公職選挙法", category: "公法・憲法", query: "公職選挙法", type: "法律" },
  { no: 12, title: "政党助成法", category: "公法・憲法", query: "政党助成法", type: "法律" },
  { no: 13, title: "裁判員法", category: "公法・憲法", query: "裁判員の参加する刑事裁判に関する法律", type: "法律" },
  { no: 14, title: "裁判所法", category: "公法・憲法", query: "裁判所法", type: "法律" },
  { no: 15, title: "内閣法", category: "公法・憲法", query: "内閣法", type: "法律" },
  { no: 16, title: "国家行政組織法", category: "公法・憲法", query: "国家行政組織法", type: "法律" },
  { no: 17, title: "国家公務員法", category: "公法・憲法", query: "国家公務員法", type: "法律" },
  { no: 18, title: "人事院規則14-7 (政治的行為)", category: "公法・憲法", query: "人事院規則一四―七", type: "省令・規則" },
  { no: 19, title: "特定秘密保護法", category: "公法・憲法", query: "特定秘密の保護に関する法律", type: "法律" },
  { no: 20, title: "地方自治法", category: "公法・憲法", query: "地方自治法", type: "法律" },

  // 行政・社会・治安 (21〜48)
  { no: 21, title: "地方公務員法", category: "行政・社会", query: "地方公務員法", type: "法律" },
  { no: 22, title: "行政手続法", category: "行政・社会", query: "行政手続法", type: "法律" },
  { no: 23, title: "行政代執行法", category: "行政・社会", query: "行政代執行法", type: "法律" },
  { no: 24, title: "行政不服審査法", category: "行政・社会", query: "行政不服審査法", type: "法律" },
  { no: 25, title: "行政事件訴訟法", category: "行政・社会", query: "行政事件訴訟法", type: "法律" },
  { no: 26, title: "国家賠償法", category: "行政・社会", query: "国家賠償法", type: "法律" },
  { no: 27, title: "公文書管理法", category: "行政・社会", query: "公文書等の管理に関する法律", type: "法律" },
  { no: 28, title: "情報公開法", category: "行政・社会", query: "行政機関の保有する情報の公開に関する法律", type: "法律" },
  { no: 29, title: "個人情報保護法", category: "行政・社会", query: "個人情報の保護に関する法律", type: "法律" },
  { no: 30, title: "新型インフル特措法", category: "行政・社会", query: "新型インフルエンザ等対策特別措置法", type: "法律" },
  { no: 31, title: "警察法", category: "行政・社会", query: "警察法", type: "法律" },
  { no: 32, title: "警察官職務執行法", category: "行政・社会", query: "警察官職務執行法", type: "法律" },
  { no: 33, title: "破壊活動防止法", category: "行政・社会", query: "破壊活動防止法", type: "法律" },
  { no: 34, title: "LGBT理解増進法", category: "行政・社会", query: "性的指向及びジェンダーアイデンティティの多様性に関する国民の理解の増進に関する法律", type: "法律" },
  { no: 35, title: "性同一性障害者特例法", category: "行政・社会", query: "性同一性障害者の性別の取扱いの特例に関する法律", type: "法律" },
  { no: 36, title: "ヘイトスピーチ解消法", category: "行政・社会", query: "本邦外出身者に対する不当な差別的言動の解消に向けた取組の推進に関する法律", type: "法律" },
  { no: 37, title: "入管法", category: "行政・社会", query: "出入国管理及び難民認定法", type: "政令・法律" },
  { no: 38, title: "国際平和支援法", category: "行政・社会", query: "国際平和共同対処事態に際して我が国が実施する諸外国の軍隊等に対する協力支援活動等に関する法律", type: "法律" },
  { no: 39, title: "サイバーセキュリティ基本法", category: "行政・社会", query: "サイバーセキュリティ基本法", type: "法律" },
  { no: 40, title: "サイバー対処能力強化法", category: "行政・社会", query: "サイバー対処能力強化法", type: "法律" },
  { no: 41, title: "経済安全保障推進法", category: "行政・社会", query: "経済施策を一体的に講ずることによる安全保障の確保の推進に関する法律", type: "法律" },
  { no: 42, title: "重要土地等調査法", category: "行政・社会", query: "重要施設周辺及び国境離島等における土地等の利用状況の調査及び利用の規制等に関する法律", type: "法律" },
  { no: 43, title: "都市計画法", category: "行政・社会", query: "都市計画法", type: "法律" },
  { no: 44, title: "建築基準法", category: "行政・社会", query: "建築基準法", type: "法律" },
  { no: 45, title: "環境基本法", category: "行政・社会", query: "環境基本法", type: "法律" },
  { no: 46, title: "原子力基本法", category: "行政・社会", query: "原子力基本法", type: "法律" },
  { no: 47, title: "廃棄物処理法", category: "行政・社会", query: "廃棄物の処理及び清掃に関する法律", type: "法律" },
  { no: 48, title: "教育基本法", category: "行政・社会", query: "教育基本法", type: "法律" },

  // 民事法・取引・消費者 (49〜64)
  { no: 49, title: "民法", category: "民法・民事", query: "民法", type: "法律" },
  { no: 50, title: "民法施行法", category: "民法・民事", query: "民法施行法", type: "法律" },
  { no: 51, title: "一般社団・財団法人法", category: "民法・民事", query: "一般社団法人及び一般財団法人に関する法律", type: "法律" },
  { no: 52, title: "動産債権譲渡特例法", category: "民法・民事", query: "動産及び債権の譲渡の対抗要件に関する民法の特例等に関する法律", type: "法律" },
  { no: 53, title: "譲渡担保法", category: "民法・民事", query: "譲渡担保", type: "法律" },
  { no: 54, title: "利息制限法", category: "民法・民事", query: "利息制限法", type: "法律" },
  { no: 55, title: "貸金業法", category: "民法・民事", query: "貸金業法", type: "法律" },
  { no: 56, title: "消費者契約法", category: "民法・民事", query: "消費者契約法", type: "法律" },
  { no: 57, title: "電子消費者契約民法特例法", category: "民法・民事", query: "電子消費者契約及び電子承諾通知に関する民法の特例に関する法律", type: "法律" },
  { no: 58, title: "特定商取引に関する法律", category: "民法・民事", query: "特定商取引に関する法律", type: "法律" },
  { no: 59, title: "割賦販売法", category: "民法・民事", query: "割賦販売法", type: "法律" },
  { no: 60, title: "借地借家法", category: "民法・民事", query: "借地借家法", type: "法律" },
  { no: 61, title: "失火ノ責任ニ関スル法律", category: "民法・民事", query: "失火ノ責任ニ関スル法律", type: "法律" },
  { no: 62, title: "製造物責任法 (PL法)", category: "民法・民事", query: "製造物責任法", type: "法律" },
  { no: 63, title: "自動車損害賠償保障法", category: "民法・民事", query: "自動車損害賠償保障法", type: "法律" },
  { no: 64, title: "任意後見契約に関する法律", category: "民法・民事", query: "任意後見契約に関する法律", type: "法律" },

  // 商法・会社・金融・民事手続 (65〜76)
  { no: 65, title: "商法", category: "商法・会社", query: "商法", type: "法律" },
  { no: 66, title: "会社法", category: "商法・会社", query: "会社法", type: "法律" },
  { no: 67, title: "保険法", category: "商法・会社", query: "保険法", type: "法律" },
  { no: 68, title: "手形法", category: "商法・会社", query: "手形法", type: "法律" },
  { no: 69, title: "小切手法", category: "商法・会社", query: "小切手法", type: "法律" },
  { no: 70, title: "金融商品取引法", category: "商法・会社", query: "金融商品取引法", type: "法律" },
  { no: 71, title: "民事訴訟法", category: "商法・会社", query: "民事訴訟法", type: "法律" },
  { no: 72, title: "民事訴訟規則", category: "商法・会社", query: "民事訴訟規則", type: "最高裁規則" },
  { no: 73, title: "人事訴訟法", category: "商法・会社", query: "人事訴訟法", type: "法律" },
  { no: 74, title: "民事執行法", category: "商法・会社", query: "民事執行法", type: "法律" },
  { no: 75, title: "破産法", category: "商法・会社", query: "破産法", type: "法律" },
  { no: 76, title: "民事再生法", category: "商法・会社", query: "民事再生法", type: "法律" },

  // 刑事法・刑事手続 (77〜86)
  { no: 77, title: "刑法", category: "刑事法", query: "刑法", type: "法律" },
  { no: 78, title: "自動車運転死傷行為処罰法", category: "刑事法", query: "自動車の運転により人を死傷させる行為等の処罰に関する法律", type: "法律" },
  { no: 79, title: "組織的犯罪処罰法", category: "刑事法", query: "組織的な犯罪の処罰及び犯罪収益の規制等に関する法律", type: "法律" },
  { no: 80, title: "覚醒剤取締法", category: "刑事法", query: "覚醒剤取締法", type: "法律" },
  { no: 81, title: "軽犯罪法", category: "刑事法", query: "軽犯罪法", type: "法律" },
  { no: 82, title: "ストーカー規制法", category: "刑事法", query: "ストーカー行為等の規制等に関する法律", type: "法律" },
  { no: 83, title: "刑事訴訟法", category: "刑事法", query: "刑事訴訟法", type: "法律" },
  { no: 84, title: "刑事訴訟規則", category: "刑事法", query: "刑事訴訟規則", type: "最高裁規則" },
  { no: 85, title: "少年法", category: "刑事法", query: "少年法", type: "法律" },
  { no: 86, title: "犯罪被害者等基本法", category: "刑事法", query: "犯罪被害者等基本法", type: "法律" },

  // 労働・知財・経済・社会保障 (87〜96)
  { no: 87, title: "労働基準法", category: "労働・知財", query: "労働基準法", type: "法律" },
  { no: 88, title: "男女雇用機会均等法", category: "労働・知財", query: "雇用の分野における男女の均等な機会及び待遇の確保等に関する法律", type: "法律" },
  { no: 89, title: "労働組合法", category: "労働・知財", query: "労働組合法", type: "法律" },
  { no: 90, title: "労働関係調整法", category: "労働・知財", query: "労働関係調整法", type: "法律" },
  { no: 91, title: "労働契約法", category: "労働・知財", query: "労働契約法", type: "法律" },
  { no: 92, title: "生活保護法", category: "労働・知財", query: "生活保護法", type: "法律" },
  { no: 93, title: "独占禁止法", category: "労働・知財", query: "私的独占の禁止及び公正取引の確保に関する法律", type: "法律" },
  { no: 94, title: "不公正な取引方法", category: "労働・知財", query: "不公正な取引方法", type: "公取委告示" },
  { no: 95, title: "特許法", category: "労働・知財", query: "特許法", type: "法律" },
  { no: 96, title: "著作権法", category: "労働・知財", query: "著作権法", type: "法律" },

  // 国際規範・条約 (97〜101)
  { no: 97, title: "国際連合憲章", category: "国際条約", query: "国際連合憲章", type: "条約" },
  { no: 98, title: "国際司法裁判所規程", category: "国際条約", query: "国際司法裁判所規程", type: "条約" },
  { no: 99, title: "世界人権宣言", category: "国際条約", query: "世界人権宣言", type: "宣言・条約" },
  { no: 100, title: "経済的・社会的・文化的権利規約 (A規約)", category: "国際条約", query: "経済的、社会的及び文化的権利に関する国際規約", type: "条約" },
  { no: 101, title: "市民的及び政治的権利規約 (B規約)", category: "国際条約", query: "市民的及び政治的権利に関する国際規約", type: "条約" }
];
