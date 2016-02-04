import pprint
import json

def create_b_reduction_schedule(x):
    out = {("B" + str(x)): []}
    for idx in range(1,21):
	if idx < x:
	    out[("B" + str(x))].append({"proportion": (x-idx)/float(x)})
	else: 
	    out[("B" + str(x))].append({"proportion": 0.0})
    return out

code_map = {}
for i in range(3,21):
    code_map.update(create_b_reduction_schedule(i))

extras = {
    "EIF": [{"proportion": 0.0}],
    "US1": [{"proportion": 0.6}, {"proportion": 0.6}, {"proportion": 0.6}, {"proportion": 0.55}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}],
    "US2": [{"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}],
    "US3": [{"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55}, {"proportion": 0.55} ],
    "US4": [{"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 0.75}, {"proportion": 0.50}, {"proportion": 0.25},  ],
    "US5": [{"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, ],
    "US6": [{"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, ],
    "US7": [{"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, ],
    "US8": [{"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, ],
    "US9": [{"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.65}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, ],
    "US10": [{"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, ],
    "US11": [{"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, {"proportion": 0.5}, ],
    "US12": [{"ad_valorem": 0.05}, {"ad_valorem": 0.05}, {"ad_valorem": 0.05}, {"ad_valorem": 0.04}, {"ad_valorem": 0.04}, {"ad_valorem": 0.04}, {"ad_valorem": 0.03}, {"ad_valorem": 0.03}, {"ad_valorem": 0.02}, {"ad_valorem": 0.02}, {"ad_valorem": 0.005},  ],
    "US13": [], ## TODO customs duties on originating goods provided for in the items in staging category US13 shall remain at base rates until December 31 of 2021. Such goods shall be duty-free effective January 1 of 2022;
    "US14": [{"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, ],
    "US15": [{"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"ad_valorem": 0.0225}, {"ad_valorem": 0.0225}, {"ad_valorem": 0.0225}, {"ad_valorem": 0.0225}, {"ad_valorem": 0.0225}, {"ad_valorem": 0.0125},  {"ad_valorem": 0.0125}, {"ad_valorem": 0.005}, {"ad_valorem": 0.005}, {"ad_valorem": 0.005}, ],
    "US16": [{"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"ad_valorem": 0.036}, {"ad_valorem": 0.036}, {"ad_valorem": 0.036}, {"ad_valorem": 0.036}, {"ad_valorem": 0.036}, {"ad_valorem": 0.02},  {"ad_valorem": 0.02}, {"ad_valorem": 0.008}, {"ad_valorem": 0.008}, {"ad_valorem": 0.008}, ],
    "US17": [{"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, {"proportion": 1.0}, ],
    "US18": [{"proportion": 0.5},{'proportion': 0.4642857142857143},
{'proportion': 0.4285714285714286},
{'proportion': 0.39285714285714285},
{'proportion': 0.35714285714285715},
{'proportion': 0.32142857142857145},
{'proportion': 0.2857142857142857},
{'proportion': 0.25},
{'proportion': 0.2142857142857143},
{'proportion': 0.1785714285714286},
{'proportion': 0.1428571428571429},
{'proportion': 0.10714285714285715},
{'proportion': 0.07142857142857145},
{'proportion': 0.035714285714285754} ],
    "US19": [{'proportion': 0.8}, {'proportion': 0.7578947368421053}, {'proportion': 0.7157894736842105}, {'proportion': 0.6736842105263159}, {'proportion': 0.6315789473684211}, {'proportion': 0.5894736842105264}, {'proportion': 0.5473684210526316}, {'proportion': 0.5052631578947369}, {'proportion': 0.46315789473684216}, {'proportion': 0.4210526315789474}, {'proportion': 0.3789473684210527}, {'proportion': 0.33684210526315794}, {'proportion': 0.2947368421052632}, {'proportion': 0.25263157894736843}, {'proportion': 0.21052631578947378}, {'proportion': 0.16842105263157903}, {'proportion': 0.12631578947368427}, {'proportion': 0.08421052631578951}, {'proportion': 0.04210526315789476},],
    "US20": [], # TODO
    "US21": [], # TODO
    "US22": [{'proportion': 0.5}, {'proportion': 0.4444444444444444}, {'proportion': 0.3888888888888889}, {'proportion': 0.33333333333333337}, {'proportion': 0.2777777777777778}, {'proportion': 0.2222222222222222}, {'proportion': 0.16666666666666669}, {'proportion': 0.11111111111111116}, {'proportion': 0.05555555555555558},],
    "US23": [{'proportion': 0.66}, {'proportion': 0.6252631578947369}, {'proportion': 0.5905263157894737}, {'proportion': 0.5557894736842106}, {'proportion': 0.5210526315789474}, {'proportion': 0.48631578947368426}, {'proportion': 0.4515789473684211}, {'proportion': 0.4168421052631579}, {'proportion': 0.3821052631578948}, {'proportion': 0.3473684210526316}, {'proportion': 0.3126315789473685}, {'proportion': 0.2778947368421053}, {'proportion': 0.24315789473684213}, {'proportion': 0.208421052631579}, {'proportion': 0.17368421052631583}, {'proportion': 0.1389473684210527}, {'proportion': 0.10421052631578953}, {'proportion': 0.06947368421052635}, {'proportion': 0.03473684210526318},],
    "US24": [{'proportion': 0.8}, {'proportion': 0.7724137931034483}, {'proportion': 0.7448275862068966}, {'proportion': 0.7172413793103448}, {'proportion': 0.6896551724137931}, {'proportion': 0.6620689655172414}, {'proportion': 0.6344827586206897}, {'proportion': 0.6068965517241379}, {'proportion': 0.5793103448275863}, {'proportion': 0.5517241379310345}, {'proportion': 0.5241379310344827}, {'proportion': 0.496551724137931}, {'proportion': 0.4689655172413793}, {'proportion': 0.4413793103448276}, {'proportion': 0.41379310344827586}, {'proportion': 0.38620689655172413}, {'proportion': 0.3586206896551724}, {'proportion': 0.3310344827586207}, {'proportion': 0.30344827586206896}, {'proportion': 0.27586206896551724}, {'proportion': 0.24827586206896546}, {'proportion': 0.2206896551724138}, {'proportion': 0.193103448275862}, {'proportion': 0.16551724137931034}, {'proportion': 0.13793103448275856}, {'proportion': 0.1103448275862069}, {'proportion': 0.08275862068965512}, {'proportion': 0.05517241379310345}, {'proportion': 0.027586206896551668},],
    "US25": [{'proportion': 0.0},],
    "TRQ": [], # TODO
}

for x in extras:
    while len(extras[x]) != 30:
	extras[x].append({"proportion": 0.0})
    code_map[x] = extras[x]

with open("US_code_map.json", "w") as of:
    json.dump(code_map, of)


