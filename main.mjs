import { ATTACK, CARRY, ERR_NOT_IN_RANGE, HEAL, MOVE, RANGED_ATTACK, RESOURCE_ENERGY, TERRAIN_PLAIN, WORK } from "game/constants";
import { Creep, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { findClosestByRange, getObjectsByPrototype, getRange, getTerrainAt } from "game/utils";
import {HaverstCreep} from "./Worker.mjs"
import {AttackEnenmy} from "./Attacker.mjs"
import {Team1_Attack} from "./BattleTeam.mjs"
import { HealMyCreep } from "./Healer.mjs";

var BattleArray = new Array();
var BattleTeamArray = new Array();
var BattleTeamRallyState = new Array();
var RallyPoint = {x : 0, y:0};
var InitIsFinished = false;
var GroupSize = 5;          // 每个攻击组的成员数量

export function loop(){
                                 
    var Mysources = getObjectsByPrototype(StructureContainer).filter(it => it.store.getUsedCapacity() > 0);
    var MySpawn = getObjectsByPrototype(StructureSpawn).find(it => it.my);
    var MyCreeps = getObjectsByPrototype(Creep).filter(it => it.my);
    // console.log(Mysource);
    var EnemyCreeps = getObjectsByPrototype(Creep).filter(it => !it.my);
    var EnmmySpawn = getObjectsByPrototype(StructureSpawn).find(it => !it.my);

    var WorkerGroup = getObjectsByPrototype(Creep).filter(it => it.body.some(bodyPart => bodyPart.type == WORK));
    // var AttackGroup = getObjectsByPrototype(Creep).filter(it => it.body.some(bodyPart => bodyPart.type == ATTACK));
    
    
    // ============ 初始化 ============ //
    if(!InitIsFinished){
        // 建立集结点(菱形范围内搜寻)
        const SEARCH_RANGE = 5;
        // 菱形上半
        for(let i = -SEARCH_RANGE; i< SEARCH_RANGE; ++i){
            RallyPoint.x = MySpawn.x + i;
            RallyPoint.y = MySpawn.y + SEARCH_RANGE - Math.abs(SEARCH_RANGE + i);
            if(getTerrainAt(RallyPoint) == TERRAIN_PLAIN){
                // 建立集结点在此处
                console.log(RallyPoint);
                break;   
            }
            // 如果找不到，在spawn周围集结
            RallyPoint.x = MySpawn.x;
            RallyPoint.y = MySpawn.y;
        }
        // 菱形下半
        
        InitIsFinished = true;
    }

    // ============ 生产部分 ============ //
    if(MyCreeps.length < 3){
        MySpawn.spawnCreep([WORK,MOVE,CARRY]).object;
    }
    else{
        if((MyCreeps.length - 3) % GroupSize == (GroupSize - 1)){
            var newCreep = MySpawn.spawnCreep([HEAL,MOVE,MOVE,MOVE,MOVE,MOVE]).object;    
        }
        else{
            var newCreep = MySpawn.spawnCreep([ATTACK,MOVE,MOVE,ATTACK,MOVE,MOVE]).object;
        }
        if(newCreep){
            BattleArray.push(newCreep);
            // 生产后进行战斗小组分组
            if(BattleArray.length % GroupSize == 0){
                let BattleTeam = new Array();
                // Team结构：Attacker,Attacker,Attacker,Attacker,Healer
                for(let i = 0; i < GroupSize; ++i){
                    BattleTeam.push(BattleArray[BattleArray.length - GroupSize + i]);
                }
                BattleTeamArray.push(BattleTeam);
                BattleTeamRallyState.push(false);  
                
            }
        }
    }

    // ============ 执行部分 ============ //
    // 到集结点集合
    for(let i = 0; i < BattleTeamArray.length; ++i){
        if(!BattleTeamRallyState[i]){
            let RallyIsReady = true;
            for(let j = 0; j < GroupSize; ++j){
                if(getRange(BattleTeamArray[i][j], RallyPoint) > 2){
                    // console.log(BattleTeamArray)
                    BattleTeamArray[i][j].moveTo(RallyPoint);
                    RallyIsReady = RallyIsReady && false;
                }
                else{
                    RallyIsReady = RallyIsReady && true;
                }
            }
            BattleTeamRallyState[i] = RallyIsReady;
        }
    }
    

    // 让搬运工采矿
    for(var worker of WorkerGroup){
        // 找到最近的矿源
        var Targetsource = findClosestByRange(MySpawn,Mysources);
        HaverstCreep(worker, Targetsource, MySpawn);
    }     

    // 进行分组攻击
    for(let i = 0; i < BattleTeamArray.length; ++i){
        // 集结完毕才能攻击
        if(BattleTeamRallyState[i]){
            var CombatLoss = Team1_Attack(BattleTeamArray[i], EnemyCreeps, EnmmySpawn);
            if(CombatLoss == 0){
                BattleTeamArray.splice(i,1);
                BattleTeamRallyState.splice(i,1);
            }
            if(CombatLoss == 2){
                let DamagedCreep = MyCreeps.filter(it => it.my && it.hits < it.hitsMax);
                var HealerMembers = BattleTeamArray[i].filter(it => it.exists && it.body.some(bodyPart => bodyPart.type == HEAL));
                for(var healermember of HealerMembers){
                    HealMyCreep(DamagedCreep, healermember);
                }
            }   
        }
    }
}
    
