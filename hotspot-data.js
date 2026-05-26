const W=1190,H=1685,total=26;
const overlays={
  "1": [
    {
      "id": "hint_1_1",
      "type": "hint",
      "args": [
        "Geser ke halaman berikutnya untuk mulai."
      ]
    }
  ],
  "2": [
    {
      "id": "mark_2_1",
      "type": "mark",
      "args": [
        97.09243058197033,
        156.63465413028882,
        76,
        "both"
      ]
    },
    {
      "id": "mark_2_2",
      "type": "mark",
      "args": [
        1014.9713338603079,
        274.1355155908958,
        76,
        "both"
      ]
    },
    {
      "id": "mark_2_3",
      "type": "mark",
      "args": [
        184,
        1127,
        76,
        "both"
      ]
    },
    {
      "id": "mark_2_4",
      "type": "mark",
      "args": [
        703,
        1127,
        76,
        "both"
      ]
    },
    {
      "id": "mark_2_5",
      "type": "mark",
      "args": [
        184,
        1487,
        76,
        "both"
      ]
    },
    {
      "id": "mark_2_6",
      "type": "mark",
      "args": [
        703,
        1487,
        76,
        "both"
      ]
    }
  ],
  "3": [
    {
      "id": "mark_3_1",
      "type": "mark",
      "args": [
        143,
        358,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_2",
      "type": "mark",
      "args": [
        553,
        358,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_3",
      "type": "mark",
      "args": [
        962,
        358,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_4",
      "type": "mark",
      "args": [
        143,
        625,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_5",
      "type": "mark",
      "args": [
        553,
        625,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_6",
      "type": "mark",
      "args": [
        962,
        625,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_7",
      "type": "mark",
      "args": [
        143,
        888,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_8",
      "type": "mark",
      "args": [
        553,
        888,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_9",
      "type": "mark",
      "args": [
        962,
        888,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_10",
      "type": "mark",
      "args": [
        143,
        1150,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_11",
      "type": "mark",
      "args": [
        553,
        1150,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_12",
      "type": "mark",
      "args": [
        962,
        1150,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_13",
      "type": "mark",
      "args": [
        143,
        1413,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_14",
      "type": "mark",
      "args": [
        553,
        1413,
        55,
        "check"
      ]
    },
    {
      "id": "mark_3_15",
      "type": "mark",
      "args": [
        962,
        1413,
        55,
        "check"
      ]
    }
  ],
  "4": [
    {
      "id": "text_4_1",
      "type": "text",
      "args": [
        55.78679745150245,
        582.2336662189389,
        320.3435297255372,
        156.62644484028704
      ]
    },
    {
      "id": "text_4_2",
      "type": "text",
      "args": [
        433.38203541032703,
        590.1455530662356,
        333.7057983816327,
        146.41236122187706
      ]
    },
    {
      "id": "text_4_3",
      "type": "text",
      "args": [
        815.0589354911564,
        587.0572144948371,
        331.8530096995055,
        145.79482612071854
      ]
    },
    {
      "id": "text_4_4",
      "type": "text",
      "args": [
        55.558808081138295,
        972.9688759234385,
        326.2940911096782,
        140.23568407908033
      ]
    },
    {
      "id": "text_4_5",
      "type": "text",
      "args": [
        430.2942016183672,
        966.1746636794829,
        333.08827582671654,
        151.97139275258155
      ]
    },
    {
      "id": "text_4_6",
      "type": "text",
      "args": [
        811.9704386470614,
        971.7335846992529,
        329.3824774450836,
        143.94177877350603
      ]
    },
    {
      "id": "text_4_7",
      "type": "text",
      "args": [
        51.85300969950549,
        1349.086546129953,
        326.9117241732836,
        147.6476524460627
      ]
    },
    {
      "id": "text_4_8",
      "type": "text",
      "args": [
        439.5590290985166,
        1350.9393724552972,
        319.4999063926398,
        147.02989632303547
      ]
    },
    {
      "id": "text_4_9",
      "type": "text",
      "args": [
        816.293980600989,
        1355.2631127618158,
        330,
        142.70648754931995
      ]
    }
  ],
  "5": [
    {
      "id": "connect_5_1",
      "type": "connect",
      "args": [
        [
          [
            510,
            608
          ],
          [
            473.6761391495696,
            848.1842215636018
          ],
          [
            477.90066531802734,
            1125.2965828182714
          ],
          [
            474.8831150523607,
            1399.3911667331263
          ]
        ],
        [
          [
            675.2202124292744,
            577.9974147983651
          ],
          [
            676.6673374575053,
            845.7701654581515
          ],
          [
            676.0638495061098,
            1123.787721776098
          ],
          [
            677.2709359175899,
            1403.0127205627728
          ]
        ]
      ]
    }
  ],
  "6": [
    {
      "id": "connect_6_1",
      "type": "connect",
      "args": [
        [
          [
            308.1015763368023,
            602.6013086035879
          ],
          [
            313.5446818204106,
            886.3917940548395
          ],
          [
            312.94014403646827,
            1169.8797281955697
          ],
          [
            312.3352747264586,
            1451.2511016661242
          ]
        ],
        [
          [
            793.2846228366298,
            604.1134573460587
          ],
          [
            792.6802508157215,
            880.6459437896135
          ],
          [
            793.5870851188072,
            1169.577370279183
          ],
          [
            797.2158589441088,
            1451.2510464106576
          ]
        ]
      ]
    }
  ],
  "7": [
    {
      "id": "mark_7_1",
      "type": "mark",
      "args": [
        329,
        458,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_2",
      "type": "mark",
      "args": [
        705,
        458,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_3",
      "type": "mark",
      "args": [
        1072,
        458,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_4",
      "type": "mark",
      "args": [
        329,
        874,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_5",
      "type": "mark",
      "args": [
        705,
        874,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_6",
      "type": "mark",
      "args": [
        1072,
        874,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_7",
      "type": "mark",
      "args": [
        329,
        1290,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_8",
      "type": "mark",
      "args": [
        705,
        1290,
        72,
        "both"
      ]
    },
    {
      "id": "mark_7_9",
      "type": "mark",
      "args": [
        1072,
        1290,
        72,
        "both"
      ]
    }
  ],
  "8": [
    {
      "id": "mark_8_1",
      "type": "mark",
      "args": [
        286,
        758,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_2",
      "type": "mark",
      "args": [
        565,
        758,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_3",
      "type": "mark",
      "args": [
        864,
        758,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_4",
      "type": "mark",
      "args": [
        286,
        1150,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_5",
      "type": "mark",
      "args": [
        565,
        1150,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_6",
      "type": "mark",
      "args": [
        864,
        1150,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_7",
      "type": "mark",
      "args": [
        286,
        1538,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_8",
      "type": "mark",
      "args": [
        565,
        1538,
        62,
        "check"
      ]
    },
    {
      "id": "mark_8_9",
      "type": "mark",
      "args": [
        864,
        1538,
        62,
        "check"
      ]
    }
  ],
  "9": [
    {
      "id": "circle_9_1",
      "type": "circle",
      "args": [
        235,
        452,
        130
      ]
    },
    {
      "id": "circle_9_2",
      "type": "circle",
      "args": [
        574,
        468,
        130
      ]
    },
    {
      "id": "circle_9_3",
      "type": "circle",
      "args": [
        884,
        475,
        130
      ]
    },
    {
      "id": "circle_9_4",
      "type": "circle",
      "args": [
        236,
        728,
        130
      ]
    },
    {
      "id": "circle_9_5",
      "type": "circle",
      "args": [
        573,
        730,
        130
      ]
    },
    {
      "id": "circle_9_6",
      "type": "circle",
      "args": [
        884,
        730,
        130
      ]
    },
    {
      "id": "circle_9_7",
      "type": "circle",
      "args": [
        237,
        1000,
        130
      ]
    },
    {
      "id": "circle_9_8",
      "type": "circle",
      "args": [
        573,
        1000,
        130
      ]
    },
    {
      "id": "circle_9_9",
      "type": "circle",
      "args": [
        884,
        1000,
        130
      ]
    },
    {
      "id": "circle_9_10",
      "type": "circle",
      "args": [
        236,
        1278,
        130
      ]
    },
    {
      "id": "circle_9_11",
      "type": "circle",
      "args": [
        573,
        1278,
        130
      ]
    },
    {
      "id": "circle_9_12",
      "type": "circle",
      "args": [
        884,
        1278,
        130
      ]
    }
  ],
  "10": [
    {
      "id": "mark_10_1",
      "type": "mark",
      "args": [
        804,
        405,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_2",
      "type": "mark",
      "args": [
        804,
        450,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_3",
      "type": "mark",
      "args": [
        804,
        495,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_4",
      "type": "mark",
      "args": [
        804,
        685,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_5",
      "type": "mark",
      "args": [
        804,
        732,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_6",
      "type": "mark",
      "args": [
        804,
        778,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_7",
      "type": "mark",
      "args": [
        804,
        980,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_8",
      "type": "mark",
      "args": [
        804,
        1028,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_9",
      "type": "mark",
      "args": [
        804,
        1074,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_10",
      "type": "mark",
      "args": [
        804,
        1283,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_11",
      "type": "mark",
      "args": [
        804,
        1330,
        36,
        "check"
      ]
    },
    {
      "id": "mark_10_12",
      "type": "mark",
      "args": [
        804,
        1378,
        36,
        "check"
      ]
    }
  ],
  "11": [
    {
      "id": "hint_11_1",
      "type": "hint",
      "args": [
        "Seret kotak jawaban ke garis kosong."
      ]
    },
    {
      "id": "dragdrop_11_2",
      "type": "dragdrop",
      "args": [
        [
          {
            "t": "menolong",
            "x": 811.7090679530005,
            "y": 545.7791203119755,
            "w": 260,
            "h": 90,
            "fontSize": 10
          },
          {
            "t": "mengejek",
            "x": 484.16402012558234,
            "y": 545.950411698812,
            "w": 260.73703838050363,
            "h": 88.42212487932318,
            "fontSize": 10
          },
          {
            "t": "saling\nmenyayangi",
            "x": 449.0873356670786,
            "y": 864.5339035741268,
            "w": 300,
            "h": 95,
            "fontSize": 9
          },
          {
            "t": "membenci",
            "x": 790,
            "y": 895,
            "w": 260,
            "h": 90
          },
          {
            "t": "menjenguk",
            "x": 470,
            "y": 1230,
            "w": 260,
            "h": 90
          },
          {
            "t": "mengejek",
            "x": 790,
            "y": 1230,
            "w": 260,
            "h": 90
          },
          {
            "t": "bertengkar",
            "x": 470,
            "y": 1510,
            "w": 260,
            "h": 90
          },
          {
            "t": "saling\nmembantu",
            "x": 790,
            "y": 1510,
            "w": 260,
            "h": 90
          }
        ],
        [
          {
            "x": 553.1911937761508,
            "y": 453.04089626007385,
            "w": 170,
            "h": 60
          },
          {
            "x": 635,
            "y": 835,
            "w": 170,
            "h": 60
          },
          {
            "x": 855,
            "y": 1168,
            "w": 170,
            "h": 60
          },
          {
            "x": 850,
            "y": 1465,
            "w": 170,
            "h": 60
          }
        ]
      ]
    }
  ],
  "12": [
    {
      "id": "text_12_1",
      "type": "text",
      "args": [
        337.5614706904954,
        497.2590054934099,
        753.8611401673642,
        90.67878209735977
      ]
    },
    {
      "id": "text_12_2",
      "type": "text",
      "args": [
        354.39221892532817,
        833.7690314913533,
        725.0292021532664,
        78.93224335229172
      ]
    },
    {
      "id": "text_12_3",
      "type": "text",
      "args": [
        370.4104534162228,
        1183.4480257565901,
        709.0111886797498,
        80
      ]
    },
    {
      "id": "text_12_4",
      "type": "text",
      "args": [
        402.04859522097286,
        1518.2721402262423,
        642.8038858941137,
        82.13562380635062
      ]
    }
  ],
  "13": [
    {
      "id": "mark_13_1",
      "type": "mark",
      "args": [
        130,
        560,
        64,
        "both"
      ]
    },
    {
      "id": "mark_13_2",
      "type": "mark",
      "args": [
        626,
        560,
        64,
        "both"
      ]
    },
    {
      "id": "mark_13_3",
      "type": "mark",
      "args": [
        130,
        1050,
        64,
        "both"
      ]
    },
    {
      "id": "mark_13_4",
      "type": "mark",
      "args": [
        626,
        1050,
        64,
        "both"
      ]
    }
  ],
  "14": [
    {
      "id": "mark_14_1",
      "type": "mark",
      "args": [
        460,
        670,
        86,
        "both"
      ]
    },
    {
      "id": "mark_14_2",
      "type": "mark",
      "args": [
        950,
        670,
        86,
        "both"
      ]
    },
    {
      "id": "mark_14_3",
      "type": "mark",
      "args": [
        460,
        1048,
        86,
        "both"
      ]
    },
    {
      "id": "mark_14_4",
      "type": "mark",
      "args": [
        950,
        1048,
        86,
        "both"
      ]
    },
    {
      "id": "mark_14_5",
      "type": "mark",
      "args": [
        460,
        1430,
        86,
        "both"
      ]
    },
    {
      "id": "mark_14_6",
      "type": "mark",
      "args": [
        950,
        1430,
        86,
        "both"
      ]
    }
  ],
  "15": [
    {
      "id": "mark_15_1",
      "type": "mark",
      "args": [
        125,
        535,
        62,
        "check"
      ]
    },
    {
      "id": "mark_15_2",
      "type": "mark",
      "args": [
        626,
        535,
        62,
        "check"
      ]
    },
    {
      "id": "mark_15_3",
      "type": "mark",
      "args": [
        125,
        1020,
        62,
        "check"
      ]
    },
    {
      "id": "mark_15_4",
      "type": "mark",
      "args": [
        626,
        1020,
        62,
        "check"
      ]
    },
    {
      "id": "mark_15_5",
      "type": "mark",
      "args": [
        125,
        1320,
        62,
        "check"
      ]
    },
    {
      "id": "mark_15_6",
      "type": "mark",
      "args": [
        626,
        1320,
        62,
        "check"
      ]
    }
  ],
  "16": [
    {
      "id": "connect_16_1",
      "type": "connect",
      "args": [
        [
          [
            500.161,
            520.165
          ],
          [
            496.58050000000003,
            713.46495
          ],
          [
            360,
            895
          ],
          [
            360,
            1080
          ],
          [
            360,
            1265
          ],
          [
            360,
            1450
          ]
        ],
        [
          [
            840,
            535
          ],
          [
            840,
            715
          ],
          [
            840,
            895
          ],
          [
            840,
            1080
          ],
          [
            840,
            1265
          ],
          [
            840,
            1450
          ]
        ]
      ]
    }
  ],
  "17": [
    {
      "id": "mark_17_1",
      "type": "mark",
      "args": [
        308,
        430,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_2",
      "type": "mark",
      "args": [
        512,
        430,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_3",
      "type": "mark",
      "args": [
        720,
        430,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_4",
      "type": "mark",
      "args": [
        308,
        735,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_5",
      "type": "mark",
      "args": [
        512,
        735,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_6",
      "type": "mark",
      "args": [
        720,
        735,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_7",
      "type": "mark",
      "args": [
        308,
        1040,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_8",
      "type": "mark",
      "args": [
        512,
        1040,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_9",
      "type": "mark",
      "args": [
        720,
        1040,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_10",
      "type": "mark",
      "args": [
        308,
        1345,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_11",
      "type": "mark",
      "args": [
        512,
        1345,
        62,
        "check"
      ]
    },
    {
      "id": "mark_17_12",
      "type": "mark",
      "args": [
        720,
        1345,
        62,
        "check"
      ]
    }
  ],
  "18": [
    {
      "id": "connect_18_1",
      "type": "connect",
      "args": [
        [
          [
            258.68892351907215,
            639.9318433650152
          ],
          [
            982.2296678870292,
            647.3760540349278
          ],
          [
            305.1238458806818,
            1255.5476102092425
          ],
          [
            619.1721404065828,
            1253.9461962595492
          ],
          [
            964.646355479151,
            1253.9463620259507
          ]
        ],
        [
          [
            427.031,
            928
          ],
          [
            700,
            928
          ]
        ]
      ]
    },
    {
      "id": "mark_1779215719761",
      "type": "mark",
      "args": [
        595,
        842.5,
        70,
        "both"
      ]
    }
  ],
  "19": [
    {
      "id": "circle_19_1",
      "type": "circle",
      "args": [
        405,
        675,
        90
      ]
    },
    {
      "id": "circle_19_2",
      "type": "circle",
      "args": [
        485,
        675,
        90
      ]
    },
    {
      "id": "circle_19_3",
      "type": "circle",
      "args": [
        870,
        675,
        90
      ]
    },
    {
      "id": "circle_19_4",
      "type": "circle",
      "args": [
        950,
        675,
        90
      ]
    },
    {
      "id": "circle_19_5",
      "type": "circle",
      "args": [
        405,
        1030,
        90
      ]
    },
    {
      "id": "circle_19_6",
      "type": "circle",
      "args": [
        485,
        1030,
        90
      ]
    },
    {
      "id": "circle_19_7",
      "type": "circle",
      "args": [
        870,
        1030,
        90
      ]
    },
    {
      "id": "circle_19_8",
      "type": "circle",
      "args": [
        950,
        1030,
        90
      ]
    },
    {
      "id": "circle_19_9",
      "type": "circle",
      "args": [
        405,
        1395,
        90
      ]
    },
    {
      "id": "circle_19_10",
      "type": "circle",
      "args": [
        485,
        1395,
        90
      ]
    },
    {
      "id": "circle_19_11",
      "type": "circle",
      "args": [
        870,
        1395,
        90
      ]
    },
    {
      "id": "circle_19_12",
      "type": "circle",
      "args": [
        950,
        1395,
        90
      ]
    }
  ],
  "20": [
    {
      "id": "text_20_1",
      "type": "text",
      "args": [
        524.495754258392,
        319.98422068738455,
        531.9367288536515,
        260.66986202857413
      ]
    },
    {
      "id": "text_20_2",
      "type": "text",
      "args": [
        533.0799012724657,
        728.8994706860728,
        519.0947351060289,
        262.6997821262174
      ]
    },
    {
      "id": "text_20_3",
      "type": "text",
      "args": [
        535.3278133469239,
        1144.8179986568166,
        511.8816119484594,
        260.7375499758648
      ]
    }
  ],
  "21": [
    {
      "id": "circle_21_1",
      "type": "circle",
      "args": [
        595,
        468,
        120
      ]
    },
    {
      "id": "circle_21_2",
      "type": "circle",
      "args": [
        870,
        468,
        120
      ]
    },
    {
      "id": "circle_21_3",
      "type": "circle",
      "args": [
        595,
        760,
        120
      ]
    },
    {
      "id": "circle_21_4",
      "type": "circle",
      "args": [
        870,
        760,
        120
      ]
    },
    {
      "id": "circle_21_5",
      "type": "circle",
      "args": [
        595,
        1055,
        120
      ]
    },
    {
      "id": "circle_21_6",
      "type": "circle",
      "args": [
        870,
        1055,
        120
      ]
    },
    {
      "id": "circle_21_7",
      "type": "circle",
      "args": [
        595,
        1350,
        120
      ]
    },
    {
      "id": "circle_21_8",
      "type": "circle",
      "args": [
        870,
        1350,
        120
      ]
    }
  ],
  "22": [
    {
      "id": "hint_22_1",
      "type": "hint",
      "args": [
        "Geser kartu kecil bawah ke kolom Sikap Baik atau Sikap Buruk."
      ]
    },
    {
      "id": "dragdrop_22_2",
      "type": "dragdrop",
      "args": [
        [
          {
            "t": "gambar 1",
            "x": 182.49941959722088,
            "y": 1198.9085507261586,
            "w": 120,
            "h": 100
          },
          {
            "t": "gambar 2",
            "x": 182.4651219718762,
            "y": 1438.6303061644767,
            "w": 120,
            "h": 100
          },
          {
            "t": "gambar 3",
            "x": 429.9646520777862,
            "y": 1442.5387463797013,
            "w": 120,
            "h": 100
          },
          {
            "t": "gambar 4",
            "x": 406.47963705603365,
            "y": 1222.359634061241,
            "w": 120,
            "h": 100
          },
          {
            "t": "gambar 5",
            "x": 663.0987862245626,
            "y": 1210.6340923936996,
            "w": 120,
            "h": 100
          },
          {
            "t": "gambar 6",
            "x": 879.3307668077217,
            "y": 1204.1199148573914,
            "w": 120,
            "h": 100
          },
          {
            "t": "gambar 7",
            "x": 629.3287767226725,
            "y": 1411.2334456587896,
            "w": 120,
            "h": 100
          },
          {
            "t": "gambar 8",
            "x": 789.5054058250523,
            "y": 1419.050105067369,
            "w": 120,
            "h": 100
          }
        ],
        [
          {
            "x": 140,
            "y": 435,
            "w": 390,
            "h": 620
          },
          {
            "x": 650,
            "y": 435,
            "w": 390,
            "h": 620
          }
        ]
      ]
    }
  ],
  "23": [
    {
      "id": "mark_23_1",
      "type": "mark",
      "args": [
        265,
        676,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_2",
      "type": "mark",
      "args": [
        595,
        676,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_3",
      "type": "mark",
      "args": [
        925,
        676,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_4",
      "type": "mark",
      "args": [
        265,
        1105,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_5",
      "type": "mark",
      "args": [
        595,
        1105,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_6",
      "type": "mark",
      "args": [
        925,
        1105,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_7",
      "type": "mark",
      "args": [
        265,
        1534,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_8",
      "type": "mark",
      "args": [
        595,
        1534,
        66,
        "both"
      ]
    },
    {
      "id": "mark_23_9",
      "type": "mark",
      "args": [
        925,
        1534,
        66,
        "both"
      ]
    }
  ],
  "24": [
    {
      "id": "text_24_1",
      "type": "text",
      "args": [
        120,
        935,
        900,
        52
      ]
    },
    {
      "id": "text_24_2",
      "type": "text",
      "args": [
        120,
        1064,
        900,
        52
      ]
    },
    {
      "id": "text_24_3",
      "type": "text",
      "args": [
        120,
        1193,
        900,
        52
      ]
    },
    {
      "id": "text_24_4",
      "type": "text",
      "args": [
        120,
        1322,
        900,
        52
      ]
    },
    {
      "id": "text_24_5",
      "type": "text",
      "args": [
        120,
        1451,
        900,
        52
      ]
    }
  ],
  "25": [
    {
      "id": "text_25_1",
      "type": "text",
      "args": [
        170,
        1040,
        830,
        70
      ]
    },
    {
      "id": "text_25_2",
      "type": "text",
      "args": [
        170,
        1223,
        830,
        70
      ]
    },
    {
      "id": "text_25_3",
      "type": "text",
      "args": [
        170,
        1392,
        830,
        70
      ]
    }
  ],
  "26": [
    {
      "id": "text_26_1",
      "type": "text",
      "args": [
        155,
        905,
        900,
        70
      ]
    },
    {
      "id": "text_26_2",
      "type": "text",
      "args": [
        155,
        1022,
        900,
        70
      ]
    },
    {
      "id": "text_26_3",
      "type": "text",
      "args": [
        155,
        1145,
        900,
        70
      ]
    },
    {
      "id": "text_26_4",
      "type": "text",
      "args": [
        155,
        1312,
        900,
        70
      ]
    },
    {
      "id": "text_26_5",
      "type": "text",
      "args": [
        155,
        1475,
        900,
        70
      ]
    }
  ]
};


/* EGK_COMPACT_IMPORT_IMAGE_PATCH */
(function(){
  if(document.getElementById('egkCompactImportImagePatch')) return;
  const st = document.createElement('style');
  st.id = 'egkCompactImportImagePatch';
  st.textContent = `
    .drag-piece-img{
      width:100%!important;
      height:100%!important;
      object-fit:contain!important;
      object-position:center!important;
      transform:scale(1.18)!important;
      transform-origin:center!important;
      pointer-events:none!important;
      user-select:none!important;
    }
    .dragItem,
    .drag-piece,
    .addonOverlay.dragItem,
    .addonOverlay.dragdrop{
      padding:0!important;
      overflow:hidden!important;
    }
  `;
  document.head.appendChild(st);
})();
