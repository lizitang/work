#!/bin/bash
curl -X POST -H "Content-Type: application/json; charset=utf-8" -d '{"data":[{ "name": "好听", "weight": 0.3323653},{ "name": "Pop", "weight": 0.32371086},{ "name": "怀旧", "weight": 0.3236675},{ "name": "张明敏", "weight": 0.26546663},{ "name": "清新", "weight": 0.26068822},{ "name": "华语女歌手", "weight": 0.19067714},{ "name": "中学时代流行，90年代", "weight": 0.18733245}],"output":"output.png"}' 0.0.0.0:8980/to_svg
