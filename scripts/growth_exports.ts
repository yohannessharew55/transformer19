
export interface GrowthCurvePoint {
  week: number;
  label: string;
  lotNum: number;
  lotStr: string;
  equity: number;
  banked: number;
  total: number;
  weeklyGain: number;
  sweep: number;
}

export interface MonthlySummaryItem {
  month: string;
  name: string;
  gross: number;
  bankOut: number;
  endingEquity: number;
}

export const PLANNED_GROWTH_CURVE: GrowthCurvePoint[] = [
  {
    "week": 1,
    "label": "W01",
    "lotNum": 0.01,
    "lotStr": "0.01",
    "equity": 75,
    "banked": 0,
    "total": 75,
    "weeklyGain": 25,
    "sweep": 0
  },
  {
    "week": 2,
    "label": "W02",
    "lotNum": 0.01,
    "lotStr": "0.01",
    "equity": 110,
    "banked": 0,
    "total": 110,
    "weeklyGain": 35,
    "sweep": 0
  },
  {
    "week": 3,
    "label": "W03",
    "lotNum": 0.02,
    "lotStr": "0.02",
    "equity": 150,
    "banked": 0,
    "total": 150,
    "weeklyGain": 40,
    "sweep": 0
  },
  {
    "week": 4,
    "label": "W04",
    "lotNum": 0.02,
    "lotStr": "0.02",
    "equity": 170,
    "banked": 30,
    "total": 200,
    "weeklyGain": 50,
    "sweep": 30
  },
  {
    "week": 5,
    "label": "W05",
    "lotNum": 0.02,
    "lotStr": "0.02",
    "equity": 220,
    "banked": 30,
    "total": 250,
    "weeklyGain": 50,
    "sweep": 0
  },
  {
    "week": 6,
    "label": "W06",
    "lotNum": 0.03,
    "lotStr": "0.03",
    "equity": 285,
    "banked": 30,
    "total": 315,
    "weeklyGain": 65,
    "sweep": 0
  },
  {
    "week": 7,
    "label": "W07",
    "lotNum": 0.03,
    "lotStr": "0.03",
    "equity": 360,
    "banked": 30,
    "total": 390,
    "weeklyGain": 75,
    "sweep": 0
  },
  {
    "week": 8,
    "label": "W08",
    "lotNum": 0.04,
    "lotStr": "0.04",
    "equity": 390,
    "banked": 90,
    "total": 480,
    "weeklyGain": 90,
    "sweep": 60
  },
  {
    "week": 9,
    "label": "W09",
    "lotNum": 0.04,
    "lotStr": "0.04",
    "equity": 490,
    "banked": 90,
    "total": 580,
    "weeklyGain": 100,
    "sweep": 0
  },
  {
    "week": 10,
    "label": "W10",
    "lotNum": 0.05,
    "lotStr": "0.05",
    "equity": 610,
    "banked": 90,
    "total": 700,
    "weeklyGain": 120,
    "sweep": 0
  },
  {
    "week": 11,
    "label": "W11",
    "lotNum": 0.06,
    "lotStr": "0.06",
    "equity": 750,
    "banked": 90,
    "total": 840,
    "weeklyGain": 140,
    "sweep": 0
  },
  {
    "week": 12,
    "label": "W12",
    "lotNum": 0.07,
    "lotStr": "0.07",
    "equity": 800,
    "banked": 190,
    "total": 990,
    "weeklyGain": 150,
    "sweep": 100
  },
  {
    "week": 13,
    "label": "W13",
    "lotNum": 0.08,
    "lotStr": "0.08",
    "equity": 960,
    "banked": 190,
    "total": 1150,
    "weeklyGain": 160,
    "sweep": 0
  },
  {
    "week": 14,
    "label": "W14",
    "lotNum": 0.09,
    "lotStr": "0.09",
    "equity": 1140,
    "banked": 190,
    "total": 1330,
    "weeklyGain": 180,
    "sweep": 0
  },
  {
    "week": 15,
    "label": "W15",
    "lotNum": 0.1,
    "lotStr": "0.10",
    "equity": 1360,
    "banked": 190,
    "total": 1550,
    "weeklyGain": 220,
    "sweep": 0
  },
  {
    "week": 16,
    "label": "W16",
    "lotNum": 0.12,
    "lotStr": "0.12",
    "equity": 1440,
    "banked": 350,
    "total": 1790,
    "weeklyGain": 240,
    "sweep": 160
  },
  {
    "week": 17,
    "label": "W17",
    "lotNum": 0.12,
    "lotStr": "0.12",
    "equity": 1700,
    "banked": 350,
    "total": 2050,
    "weeklyGain": 260,
    "sweep": 0
  },
  {
    "week": 18,
    "label": "W18",
    "lotNum": 0.15,
    "lotStr": "0.15",
    "equity": 2000,
    "banked": 350,
    "total": 2350,
    "weeklyGain": 300,
    "sweep": 0
  },
  {
    "week": 19,
    "label": "W19",
    "lotNum": 0.16,
    "lotStr": "0.16",
    "equity": 2340,
    "banked": 350,
    "total": 2690,
    "weeklyGain": 340,
    "sweep": 0
  },
  {
    "week": 20,
    "label": "W20",
    "lotNum": 0.18,
    "lotStr": "0.18",
    "equity": 2450,
    "banked": 600,
    "total": 3050,
    "weeklyGain": 360,
    "sweep": 250
  },
  {
    "week": 21,
    "label": "W21",
    "lotNum": 0.2,
    "lotStr": "0.20",
    "equity": 2870,
    "banked": 600,
    "total": 3470,
    "weeklyGain": 420,
    "sweep": 0
  },
  {
    "week": 22,
    "label": "W22",
    "lotNum": 0.22,
    "lotStr": "0.22",
    "equity": 3350,
    "banked": 600,
    "total": 3950,
    "weeklyGain": 480,
    "sweep": 0
  },
  {
    "week": 23,
    "label": "W23",
    "lotNum": 0.25,
    "lotStr": "0.25",
    "equity": 3900,
    "banked": 600,
    "total": 4500,
    "weeklyGain": 550,
    "sweep": 0
  },
  {
    "week": 24,
    "label": "W24",
    "lotNum": 0.28,
    "lotStr": "0.28",
    "equity": 4090,
    "banked": 1010,
    "total": 5100,
    "weeklyGain": 600,
    "sweep": 410
  },
  {
    "week": 25,
    "label": "W25",
    "lotNum": 0.3,
    "lotStr": "0.30",
    "equity": 4730,
    "banked": 1010,
    "total": 5740,
    "weeklyGain": 640,
    "sweep": 0
  },
  {
    "week": 26,
    "label": "W26",
    "lotNum": 0.35,
    "lotStr": "0.35",
    "equity": 5450,
    "banked": 1010,
    "total": 6460,
    "weeklyGain": 720,
    "sweep": 0
  },
  {
    "week": 27,
    "label": "W27",
    "lotNum": 0.38,
    "lotStr": "0.38",
    "equity": 6200,
    "banked": 1010,
    "total": 7210,
    "weeklyGain": 750,
    "sweep": 0
  },
  {
    "week": 28,
    "label": "W28",
    "lotNum": 0.4,
    "lotStr": "0.40",
    "equity": 6420,
    "banked": 1590,
    "total": 8010,
    "weeklyGain": 800,
    "sweep": 580
  },
  {
    "week": 29,
    "label": "W29",
    "lotNum": 0.45,
    "lotStr": "0.45",
    "equity": 7320,
    "banked": 1590,
    "total": 8910,
    "weeklyGain": 900,
    "sweep": 0
  },
  {
    "week": 30,
    "label": "W30",
    "lotNum": 0.5,
    "lotStr": "0.50",
    "equity": 8320,
    "banked": 1590,
    "total": 9910,
    "weeklyGain": 1000,
    "sweep": 0
  },
  {
    "week": 31,
    "label": "W31",
    "lotNum": 0.55,
    "lotStr": "0.55",
    "equity": 9400,
    "banked": 1590,
    "total": 10990,
    "weeklyGain": 1080,
    "sweep": 0
  },
  {
    "week": 32,
    "label": "W32",
    "lotNum": 0.6,
    "lotStr": "0.60",
    "equity": 9690,
    "banked": 2400,
    "total": 12090,
    "weeklyGain": 1100,
    "sweep": 810
  },
  {
    "week": 33,
    "label": "W33",
    "lotNum": 0.65,
    "lotStr": "0.65",
    "equity": 10940,
    "banked": 2400,
    "total": 13340,
    "weeklyGain": 1250,
    "sweep": 0
  },
  {
    "week": 34,
    "label": "W34",
    "lotNum": 0.7,
    "lotStr": "0.70",
    "equity": 12290,
    "banked": 2400,
    "total": 14690,
    "weeklyGain": 1350,
    "sweep": 0
  },
  {
    "week": 35,
    "label": "W35",
    "lotNum": 0.75,
    "lotStr": "0.75",
    "equity": 13640,
    "banked": 2400,
    "total": 16040,
    "weeklyGain": 1350,
    "sweep": 0
  },
  {
    "week": 36,
    "label": "W36",
    "lotNum": 0.8,
    "lotStr": "0.80",
    "equity": 13940,
    "banked": 3460,
    "total": 17400,
    "weeklyGain": 1360,
    "sweep": 1060
  },
  {
    "week": 37,
    "label": "W37",
    "lotNum": 0.8,
    "lotStr": "0.80",
    "equity": 15290,
    "banked": 3460,
    "total": 18750,
    "weeklyGain": 1350,
    "sweep": 0
  },
  {
    "week": 38,
    "label": "W38",
    "lotNum": 0.85,
    "lotStr": "0.85",
    "equity": 16660,
    "banked": 3460,
    "total": 20120,
    "weeklyGain": 1370,
    "sweep": 0
  },
  {
    "week": 39,
    "label": "W39",
    "lotNum": 0.9,
    "lotStr": "0.90",
    "equity": 18080,
    "banked": 3460,
    "total": 21540,
    "weeklyGain": 1420,
    "sweep": 0
  },
  {
    "week": 40,
    "label": "W40",
    "lotNum": 1,
    "lotStr": "1.00",
    "equity": 18390,
    "banked": 4570,
    "total": 22960,
    "weeklyGain": 1420,
    "sweep": 1110
  },
  {
    "week": 41,
    "label": "W41",
    "lotNum": 1,
    "lotStr": "1.00",
    "equity": 19990,
    "banked": 4570,
    "total": 24560,
    "weeklyGain": 1600,
    "sweep": 0
  },
  {
    "week": 42,
    "label": "W42",
    "lotNum": 1.1,
    "lotStr": "1.10",
    "equity": 21640,
    "banked": 4570,
    "total": 26210,
    "weeklyGain": 1650,
    "sweep": 0
  },
  {
    "week": 43,
    "label": "W43",
    "lotNum": 1.2,
    "lotStr": "1.20",
    "equity": 23300,
    "banked": 4570,
    "total": 27870,
    "weeklyGain": 1660,
    "sweep": 0
  },
  {
    "week": 44,
    "label": "W44",
    "lotNum": 1.25,
    "lotStr": "1.25",
    "equity": 23680,
    "banked": 5890,
    "total": 29570,
    "weeklyGain": 1700,
    "sweep": 1320
  },
  {
    "week": 45,
    "label": "W45",
    "lotNum": 1.3,
    "lotStr": "1.30",
    "equity": 25480,
    "banked": 5890,
    "total": 31370,
    "weeklyGain": 1800,
    "sweep": 0
  },
  {
    "week": 46,
    "label": "W46",
    "lotNum": 1.4,
    "lotStr": "1.40",
    "equity": 27360,
    "banked": 5890,
    "total": 33250,
    "weeklyGain": 1880,
    "sweep": 0
  },
  {
    "week": 47,
    "label": "W47",
    "lotNum": 1.5,
    "lotStr": "1.50",
    "equity": 30000,
    "banked": 5890,
    "total": 35890,
    "weeklyGain": 2640,
    "sweep": 0
  },
  {
    "week": 48,
    "label": "W48",
    "lotNum": 1.5,
    "lotStr": "1.50 CAP",
    "equity": 30000,
    "banked": 7150,
    "total": 37150,
    "weeklyGain": 1260,
    "sweep": 1260
  }
];

export const MONTHLY_SUMMARY: MonthlySummaryItem[] = [
  {
    "month": "M01",
    "name": "October",
    "gross": 150,
    "bankOut": 30,
    "endingEquity": 170
  },
  {
    "month": "M02",
    "name": "November",
    "gross": 280,
    "bankOut": 60,
    "endingEquity": 390
  },
  {
    "month": "M03",
    "name": "December",
    "gross": 510,
    "bankOut": 100,
    "endingEquity": 800
  },
  {
    "month": "M04",
    "name": "January",
    "gross": 800,
    "bankOut": 160,
    "endingEquity": 1440
  },
  {
    "month": "M05",
    "name": "February",
    "gross": 1260,
    "bankOut": 250,
    "endingEquity": 2450
  },
  {
    "month": "M06",
    "name": "March",
    "gross": 2050,
    "bankOut": 410,
    "endingEquity": 4090
  },
  {
    "month": "M07",
    "name": "April",
    "gross": 2910,
    "bankOut": 580,
    "endingEquity": 6420
  },
  {
    "month": "M08",
    "name": "May",
    "gross": 4080,
    "bankOut": 810,
    "endingEquity": 9690
  },
  {
    "month": "M09",
    "name": "June",
    "gross": 5310,
    "bankOut": 1060,
    "endingEquity": 13940
  },
  {
    "month": "M10",
    "name": "July",
    "gross": 5560,
    "bankOut": 1110,
    "endingEquity": 18390
  },
  {
    "month": "M11",
    "name": "August",
    "gross": 6610,
    "bankOut": 1320,
    "endingEquity": 23680
  },
  {
    "month": "M12",
    "name": "September",
    "gross": 7580,
    "bankOut": 1260,
    "endingEquity": 30000
  }
];
