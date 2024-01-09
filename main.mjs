import { ATTACK, CARRY, ERR_NOT_IN_RANGE, MOVE, RANGED_ATTACK, RESOURCE_ENERGY, TERRAIN_PLAIN, WORK } from "game/constants";
import { Creep, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { findClosestByRange, getObjectsByPrototype, getRange, getTerrainAt } from "game/utils";
import {HaverstCreep} from "./Worker.mjs"
import {AttackEnenmy} from "./Attacker.mjs"


var AttackerArray = new Array();
var AttackerTeamArray = new Array();
var RallyPoint = {x : 0, y:0};
var InitIsFinished = false;

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
        const SEARCH_RANGE = 8;
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
        var newCreep = MySpawn.spawnCreep([ATTACK,MOVE,MOVE,MOVE,MOVE]).object;
        if(newCreep){
            AttackerArray.push(newCreep);
            // 生产后进行攻击手分组
            if(AttackerArray.length % 4 == 0){
                AttackerTeamArray.push({member1:AttackerArray[AttackerArray.length - 1],
                                        member2:AttackerArray[AttackerArray.length - 2],
                                        member3:AttackerArray[AttackerArray.length - 3],
                                        member4:AttackerArray[AttackerArray.length - 4]});    
            }
        }
    }

    // ============ 执行部分 ============ //
    // 到集结点集合
    var re = AttackerArray.length % 4;
    if(re != 0){
        for(let i = 0; i < re; ++i){
            AttackerArray[AttackerArray.length - 1 - i].moveTo(RallyPoint);
        }
    }
    

    // 让搬运工采矿
    for(var worker of WorkerGroup){
        // 找到最近的矿源
        var Targetsource = findClosestByRange(MySpawn,Mysources);
        HaverstCreep(worker, Targetsource, MySpawn);
    }     

    // 进行分组攻击
    if(EnemyCreeps.length > 0){
        for(let i = 0; i < AttackerTeamArray.length; ++i){
            if(AttackerTeamArray[i].member1.exists){
                var TargetEnemy = findClosestByRange(AttackerTeamArray[i].member1,EnemyCreeps);
                AttackEnenmy(AttackerTeamArray[i].member1, TargetEnemy);
                AttackEnenmy(AttackerTeamArray[i].member2, TargetEnemy);
                AttackEnenmy(AttackerTeamArray[i].member3, TargetEnemy);
                AttackEnenmy(AttackerTeamArray[i].member4, TargetEnemy);
            }
            else if(AttackerTeamArray[i].member2.exists){
                var TargetEnemy = findClosestByRange(AttackerTeamArray[i].member2,EnemyCreeps);
                AttackEnenmy(AttackerTeamArray[i].member2, TargetEnemy);
                AttackEnenmy(AttackerTeamArray[i].member3, TargetEnemy);
                AttackEnenmy(AttackerTeamArray[i].member4, TargetEnemy);
            }
            else if(AttackerTeamArray[i].member3.exists){
                var TargetEnemy = findClosestByRange(AttackerTeamArray[i].member3,EnemyCreeps);
                AttackEnenmy(AttackerTeamArray[i].member3, TargetEnemy);
                AttackEnenmy(AttackerTeamArray[i].member4, TargetEnemy);
            }
            else if(AttackerTeamArray[i].member4.exists){
                var TargetEnemy = findClosestByRange(AttackerTeamArray[i].member4,EnemyCreeps);
                AttackEnenmy(AttackerTeamArray[i].member4, TargetEnemy);
            }
            else{
                AttackerTeamArray.splice(i,1);
            }
            
        }
    }
    else{
        for(var attacker of AttackerArray){
            AttackEnenmy(attacker, EnmmySpawn);
        } 
    }
    /*
    if(AttackerTeamArray.length > 0){
        if(EnemyCreeps.length > 0){
            if(EnemyCreeps.length > AttackerTeamArray.length){
                for(let i = 0; i < AttackerTeamArray.length; ++i){
                    AttackEnenmy(AttackerTeamArray[i].member1, EnemyCreeps[i]);
                    AttackEnenmy(AttackerTeamArray[i].member2, EnemyCreeps[i]);
                    AttackEnenmy(AttackerTeamArray[i].member3, EnemyCreeps[i]);
                }
            }
            else{
                for(let i = 0; i < EnemyCreeps.length; ++i){
                    AttackEnenmy(AttackerTeamArray[i].member1, EnemyCreeps[i]);
                    AttackEnenmy(AttackerTeamArray[i].member2, EnemyCreeps[i]);
                    AttackEnenmy(AttackerTeamArray[i].member3, EnemyCreeps[i]);
                }
            }
        }
        else{
            for(var attacker of AttackerArray){
                AttackEnenmy(attacker, EnmmySpawn);
        }  
    }
    }
    */
   
}
    
