import { ATTACK, HEAL } from "game/constants";
import { AttackEnenmy } from "./Attacker.mjs";
import { Creep, Source, StructureContainer, StructureSpawn } from "game/prototypes";
import { findClosestByRange } from "game/utils";
import {FollowTeam, HealMyCreep} from './Healer.mjs'


// 此处只定义小队行为，是Attacker.mjs等结构的上层结构


// Team1 ：Attacker,Attacker,Attacker,Attacker,Healer
// 返回值
    // 返回0 表示小队全灭
    // 返回1 表示只存在攻击者
    // 返回2 表示只存在治疗者
    // 返回3 表示治疗者攻击者都有存活
export function Team1_Attack(Team, EnemyCreeps, EnmmySpawn){
    
    // 筛选出存活单位
    var AttackMembers = Team.filter(it => it.exists && it.body.some(bodyPart => bodyPart.type == ATTACK));
    var HealerMembers = Team.filter(it => it.exists && it.body.some(bodyPart => bodyPart.type == HEAL));
    
    if(AttackMembers.length > 0){
        // 寻找敌人
        if(EnemyCreeps.length > 0){
            var TargetEnemy = findClosestByRange(AttackMembers[0], EnemyCreeps);
        }
        else{
            TargetEnemy = EnmmySpawn;
        }
        
        // 进行攻击
        for(var attackmember of AttackMembers){
            AttackEnenmy(attackmember, TargetEnemy);
        }
        if(HealerMembers.length > 0){     
            var DamagedCreep = AttackMembers.filter(it => it.hits < it.hitsMax);
            if(DamagedCreep.length > 0){
                for(var healermember of HealerMembers){
                    HealMyCreep(DamagedCreep, healermember);
                } 
            }
            else{
                for(var healermember of HealerMembers){
                    FollowTeam(healermember,AttackMembers[0]);
                }
            }
        }
        else{
            // 只存在攻击者
            return 1;
        }
        
        
    }
    else{
        if(HealerMembers.length > 0){
            // 返回2 表示只存在治疗者
            return 2;
        }
        else{
            // 返回0 表示小队全灭
            return 0;
        }
    }

} 