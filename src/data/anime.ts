// 本地番剧数据配置
export interface AnimeItem {
	title: string;
	status: "watching" | "completed" | "planned";
	rating: number;
	cover: string;
	description: string;
	episodes: string;
	year: string;
	genre: string[];
	studio: string;
	link: string;
	progress: number;
	totalEpisodes: number;
	startDate: string;
	endDate: string;
}

/*
 * 番剧数据格式说明 —— 添加新番剧时，参考以下模板往 localAnimeList 数组中添加：
 *
 * {
 *   title: "番剧名",
 *   status: "watching" | "completed" | "planned",  // 观看状态
 *   rating: 9.0,                                    // 评分 0-10
 *   cover: "/assets/anime/xxx.webp",                // 封面图路径
 *   description: "简介",
 *   episodes: "12 episodes",
 *   year: "2024",
 *   genre: ["标签1", "标签2"],
 *   studio: "制作公司",
 *   link: "https://...",                            // 番剧页面链接
 *   progress: 8,                                    // 已看集数
 *   totalEpisodes: 12,                              // 总集数
 *   startDate: "2024-01",                          // 开播日期 YYYY-MM
 *   endDate: "2024-03",                            // 完结日期 YYYY-MM
 * }
 */
const localAnimeList: AnimeItem[] = [];

export default localAnimeList;
