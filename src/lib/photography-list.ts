export interface PhotographyImage {
	id: string;
	url: string;
	aspectRatio: string;
	srcset: string;
}

export const photographySlug = (city: string) => city.toLowerCase().replace(/\s+/g, '-');

export const photographyData: Record<string, PhotographyImage[]> = {
	Amsterdam: [
		{
			id: 'amsterdam-1',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-1_s8q0xe.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-1_s8q0xe.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-1_s8q0xe.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-1_s8q0xe.webp 1200w'
		},
		{
			id: 'amsterdam-2',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-2_onatyz.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-2_onatyz.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-2_onatyz.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-2_onatyz.webp 1200w'
		},
		{
			id: 'amsterdam-3',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-3_lux98t.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-3_lux98t.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-3_lux98t.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-3_lux98t.webp 1200w'
		},
		{
			id: 'amsterdam-4',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-4_mgk0dj.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-4_mgk0dj.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-4_mgk0dj.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-4_mgk0dj.webp 1200w'
		},
		{
			id: 'amsterdam-5',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-5_cp5jpg.webp',
			aspectRatio: '1910/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-5_cp5jpg.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-5_cp5jpg.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-5_cp5jpg.webp 1200w'
		},
		{
			id: 'amsterdam-6',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-6_fmacgm.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-6_fmacgm.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-6_fmacgm.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-6_fmacgm.webp 1200w'
		},
		{
			id: 'amsterdam-7',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-7_s8074w.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-7_s8074w.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-7_s8074w.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-7_s8074w.webp 1200w'
		},
		{
			id: 'amsterdam-8',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-8_nbf87k.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-8_nbf87k.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-8_nbf87k.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-8_nbf87k.webp 1200w'
		},
		{
			id: 'amsterdam-9',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-9_dw3sko.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-9_dw3sko.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-9_dw3sko.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-9_dw3sko.webp 1200w'
		},
		{
			id: 'amsterdam-10',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-10_ltsoa5.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-10_ltsoa5.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-10_ltsoa5.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-10_ltsoa5.webp 1200w'
		},
		{
			id: 'amsterdam-11',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-11_occaoj.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-11_occaoj.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-11_occaoj.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-11_occaoj.webp 1200w'
		},
		{
			id: 'amsterdam-12',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-12_fi1wis.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-12_fi1wis.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-12_fi1wis.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-12_fi1wis.webp 1200w'
		},
		{
			id: 'amsterdam-13',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-13_jtnbee.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-13_jtnbee.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-13_jtnbee.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-13_jtnbee.webp 1200w'
		},
		{
			id: 'amsterdam-14',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-14_kpj1ix.webp',
			aspectRatio: '1152/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-14_kpj1ix.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-14_kpj1ix.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-14_kpj1ix.webp 1200w'
		},
		{
			id: 'amsterdam-15',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-15_bixli4.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-15_bixli4.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-15_bixli4.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-15_bixli4.webp 1200w'
		},
		{
			id: 'amsterdam-16',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-16_mp0p5s.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-16_mp0p5s.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-16_mp0p5s.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-16_mp0p5s.webp 1200w'
		},
		{
			id: 'amsterdam-17',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/amsterdam-17_rgpqpk.webp',
			aspectRatio: '1638/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/amsterdam-17_rgpqpk.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/amsterdam-17_rgpqpk.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/amsterdam-17_rgpqpk.webp 1200w'
		}
	],
	Berlin: [
		{
			id: 'berlin-1',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-1_f9txoh.webp',
			aspectRatio: '1365/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-1_f9txoh.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-1_f9txoh.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-1_f9txoh.webp 1200w'
		},
		{
			id: 'berlin-2',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-2_ibjzxf.webp',
			aspectRatio: '1281/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-2_ibjzxf.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-2_ibjzxf.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-2_ibjzxf.webp 1200w'
		},
		{
			id: 'berlin-3',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-3_avojvn.webp',
			aspectRatio: '1625/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-3_avojvn.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-3_avojvn.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-3_avojvn.webp 1200w'
		},
		{
			id: 'berlin-4',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-4_i21si4.webp',
			aspectRatio: '1220/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-4_i21si4.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-4_i21si4.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-4_i21si4.webp 1200w'
		},
		{
			id: 'berlin-5',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-5_sdsutn.webp',
			aspectRatio: '1365/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-5_sdsutn.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-5_sdsutn.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-5_sdsutn.webp 1200w'
		},
		{
			id: 'berlin-6',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-6_gtjx81.webp',
			aspectRatio: '2048/1358',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-6_gtjx81.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-6_gtjx81.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-6_gtjx81.webp 1200w'
		},
		{
			id: 'berlin-7',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-7_bmd9uo.webp',
			aspectRatio: '2048/1808',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-7_bmd9uo.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-7_bmd9uo.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-7_bmd9uo.webp 1200w'
		},
		{
			id: 'berlin-8',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-8_cwxazk.webp',
			aspectRatio: '2048/1226',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-8_cwxazk.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-8_cwxazk.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-8_cwxazk.webp 1200w'
		},
		{
			id: 'berlin-9',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-9_lx8zyh.webp',
			aspectRatio: '2048/1602',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-9_lx8zyh.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-9_lx8zyh.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-9_lx8zyh.webp 1200w'
		},
		{
			id: 'berlin-10',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-10_ttlxhv.webp',
			aspectRatio: '2048/1854',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-10_ttlxhv.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-10_ttlxhv.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-10_ttlxhv.webp 1200w'
		},
		{
			id: 'berlin-11',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/berlin-11_kj2ws9.webp',
			aspectRatio: '2048/1152',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/berlin-11_kj2ws9.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/berlin-11_kj2ws9.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/berlin-11_kj2ws9.webp 1200w'
		}
	],
	Brussels: [
		{
			id: 'brussels-1',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113923/brussels-1_mp2rug.webp',
			aspectRatio: '2048/2044',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113923/brussels-1_mp2rug.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113923/brussels-1_mp2rug.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113923/brussels-1_mp2rug.webp 1200w'
		},
		{
			id: 'brussels-2',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113925/brussels-10_mj8gbc.webp',
			aspectRatio: '1530/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113925/brussels-10_mj8gbc.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113925/brussels-10_mj8gbc.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113925/brussels-10_mj8gbc.webp 1200w'
		},
		{
			id: 'brussels-3',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113925/brussels-11_kao6w8.webp',
			aspectRatio: '2048/1530',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113925/brussels-11_kao6w8.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113925/brussels-11_kao6w8.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113925/brussels-11_kao6w8.webp 1200w'
		},
		{
			id: 'brussels-4',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113925/brussels-12_lo0igy.webp',
			aspectRatio: '1409/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113925/brussels-12_lo0igy.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113925/brussels-12_lo0igy.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113925/brussels-12_lo0igy.webp 1200w'
		},
		{
			id: 'brussels-5',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113926/brussels-13_cgaik7.webp',
			aspectRatio: '2048/2035',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113926/brussels-13_cgaik7.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113926/brussels-13_cgaik7.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113926/brussels-13_cgaik7.webp 1200w'
		},
		{
			id: 'brussels-6',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113926/brussels-14_hpx76j.webp',
			aspectRatio: '2048/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113926/brussels-14_hpx76j.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113926/brussels-14_hpx76j.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113926/brussels-14_hpx76j.webp 1200w'
		},
		{
			id: 'brussels-7',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113926/brussels-15_hvnzl5.webp',
			aspectRatio: '2048/2039',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113926/brussels-15_hvnzl5.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113926/brussels-15_hvnzl5.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113926/brussels-15_hvnzl5.webp 1200w'
		},
		{
			id: 'brussels-8',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113926/brussels-16_vgulwe.webp',
			aspectRatio: '2048/1918',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113926/brussels-16_vgulwe.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113926/brussels-16_vgulwe.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113926/brussels-16_vgulwe.webp 1200w'
		},
		{
			id: 'brussels-9',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113926/brussels-17_jgcisa.webp',
			aspectRatio: '1904/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113926/brussels-17_jgcisa.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113926/brussels-17_jgcisa.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113926/brussels-17_jgcisa.webp 1200w'
		},
		{
			id: 'brussels-10',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113923/brussels-2_jljw39.webp',
			aspectRatio: '2048/1956',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113923/brussels-2_jljw39.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113923/brussels-2_jljw39.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113923/brussels-2_jljw39.webp 1200w'
		},
		{
			id: 'brussels-11',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113923/brussels-3_dk92x3.webp',
			aspectRatio: '2047/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113923/brussels-3_dk92x3.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113923/brussels-3_dk92x3.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113923/brussels-3_dk92x3.webp 1200w'
		},
		{
			id: 'brussels-12',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113923/brussels-4_arqe8v.webp',
			aspectRatio: '1380/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113923/brussels-4_arqe8v.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113923/brussels-4_arqe8v.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113923/brussels-4_arqe8v.webp 1200w'
		},
		{
			id: 'brussels-13',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113923/brussels-5_nxa9pi.webp',
			aspectRatio: '2048/1770',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113923/brussels-5_nxa9pi.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113923/brussels-5_nxa9pi.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113923/brussels-5_nxa9pi.webp 1200w'
		},
		{
			id: 'brussels-14',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113924/brussels-6_yjj4f4.webp',
			aspectRatio: '1770/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113924/brussels-6_yjj4f4.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113924/brussels-6_yjj4f4.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113924/brussels-6_yjj4f4.webp 1200w'
		},
		{
			id: 'brussels-15',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113924/brussels-7_fs0jyd.webp',
			aspectRatio: '1548/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113924/brussels-7_fs0jyd.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113924/brussels-7_fs0jyd.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113924/brussels-7_fs0jyd.webp 1200w'
		},
		{
			id: 'brussels-16',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113924/brussels-8_f3pgle.webp',
			aspectRatio: '1668/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113924/brussels-8_f3pgle.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113924/brussels-8_f3pgle.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113924/brussels-8_f3pgle.webp 1200w'
		},
		{
			id: 'brussels-17',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1784113925/brussels-9_n9hpzx.webp',
			aspectRatio: '1686/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1784113925/brussels-9_n9hpzx.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1784113925/brussels-9_n9hpzx.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1784113925/brussels-9_n9hpzx.webp 1200w'
		}
	],
	Copenhagen: [
		{
			id: 'copenhagen-1',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/copenhagen-1_qh44jd.webp',
			aspectRatio: '1559/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/copenhagen-1_qh44jd.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/copenhagen-1_qh44jd.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/copenhagen-1_qh44jd.webp 1200w'
		},
		{
			id: 'copenhagen-2',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/copenhagen-2_qpitcu.webp',
			aspectRatio: '1669/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/copenhagen-2_qpitcu.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/copenhagen-2_qpitcu.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/copenhagen-2_qpitcu.webp 1200w'
		},
		{
			id: 'copenhagen-3',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/copenhagen-3_bye6xm.webp',
			aspectRatio: '1609/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/copenhagen-3_bye6xm.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/copenhagen-3_bye6xm.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/copenhagen-3_bye6xm.webp 1200w'
		},
		{
			id: 'copenhagen-4',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/copenhagen-4_oqtnuz.webp',
			aspectRatio: '1174/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/copenhagen-4_oqtnuz.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/copenhagen-4_oqtnuz.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/copenhagen-4_oqtnuz.webp 1200w'
		},
		{
			id: 'copenhagen-5',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/copenhagen-5_khbzu2.webp',
			aspectRatio: '1486/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/copenhagen-5_khbzu2.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/copenhagen-5_khbzu2.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/copenhagen-5_khbzu2.webp 1200w'
		},
		{
			id: 'copenhagen-6',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/copenhagen-6_vut791.webp',
			aspectRatio: '1365/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/copenhagen-6_vut791.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/copenhagen-6_vut791.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/copenhagen-6_vut791.webp 1200w'
		},
		{
			id: 'copenhagen-7',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/copenhagen-7_vffb1x.webp',
			aspectRatio: '1682/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/copenhagen-7_vffb1x.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/copenhagen-7_vffb1x.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/copenhagen-7_vffb1x.webp 1200w'
		}
	],
	York: [
		{
			id: 'york-1',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-11_bir2sx.webp',
			aspectRatio: '2048/1358',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-11_bir2sx.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-11_bir2sx.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-11_bir2sx.webp 1200w'
		},
		{
			id: 'york-2',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-12_crfvai.webp',
			aspectRatio: '2048/1258',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-12_crfvai.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-12_crfvai.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-12_crfvai.webp 1200w'
		},
		{
			id: 'york-3',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-13_kzvolj.webp',
			aspectRatio: '1426/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-13_kzvolj.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-13_kzvolj.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-13_kzvolj.webp 1200w'
		},
		{
			id: 'york-4',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-14_t3kaae.webp',
			aspectRatio: '1358/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-14_t3kaae.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-14_t3kaae.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-14_t3kaae.webp 1200w'
		},
		{
			id: 'york-5',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-8_qr7gon.webp',
			aspectRatio: '1106/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-8_qr7gon.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-8_qr7gon.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-8_qr7gon.webp 1200w'
		},
		{
			id: 'york-6',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-1_no0lbp.webp',
			aspectRatio: '2048/1365',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-1_no0lbp.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-1_no0lbp.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-1_no0lbp.webp 1200w'
		},
		{
			id: 'york-7',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-2_hrt0tm.webp',
			aspectRatio: '2048/1109',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-2_hrt0tm.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-2_hrt0tm.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-2_hrt0tm.webp 1200w'
		},
		{
			id: 'york-8',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-3_dfsap2.webp',
			aspectRatio: '1358/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-3_dfsap2.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-3_dfsap2.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-3_dfsap2.webp 1200w'
		},
		{
			id: 'york-9',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-4_jk5aq8.webp',
			aspectRatio: '1426/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-4_jk5aq8.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-4_jk5aq8.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-4_jk5aq8.webp 1200w'
		},
		{
			id: 'york-10',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-5_utb7wd.webp',
			aspectRatio: '2048/1358',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-5_utb7wd.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-5_utb7wd.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-5_utb7wd.webp 1200w'
		},
		{
			id: 'york-11',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-6_n0rffz.webp',
			aspectRatio: '2048/1334',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-6_n0rffz.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-6_n0rffz.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-6_n0rffz.webp 1200w'
		},
		{
			id: 'york-12',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-7_ko9kaz.webp',
			aspectRatio: '1358/2048',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-7_ko9kaz.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-7_ko9kaz.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-7_ko9kaz.webp 1200w'
		},
		{
			id: 'york-13',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-9_kx5pr4.webp',
			aspectRatio: '2048/1358',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-9_kx5pr4.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-9_kx5pr4.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-9_kx5pr4.webp 1200w'
		},
		{
			id: 'york-14',
			url: 'https://res.cloudinary.com/dvnkil9d4/image/upload/v1766877566/york-10_vtxyzj.webp',
			aspectRatio: '2048/1506',
			srcset:
				'https://res.cloudinary.com/dvnkil9d4/image/upload/w_400/v1766877566/york-10_vtxyzj.webp 400w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_800/v1766877566/york-10_vtxyzj.webp 800w, https://res.cloudinary.com/dvnkil9d4/image/upload/w_1200/v1766877566/york-10_vtxyzj.webp 1200w'
		}
	]
};
