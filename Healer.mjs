import { ERR_NOT_IN_RANGE } from "game/constants";
import { findClosestByRange, getObjectsByPrototype, getRange, getTerrainAt } from "game/utils";
import { Creep } from "game/prototypes";

// 注：只定义单体行为，群体行为通过上层结构进行封装


// 治疗函数
export function HealMyCreep(damagedCreep, healer){
    // let DamagedCreep = MyCreeps.filter(it => it.my && it.hits < it.hitsMax);
    let TargetDamagedCreep = healer.findClosestByRange(damagedCreep);
    if (healer.heal(TargetDamagedCreep) == ERR_NOT_IN_RANGE) {
        healer.moveTo(TargetDamagedCreep);
    }    
}

// 治疗者跟随函数
export function FollowTeam(healer, target){
    if(getRange(healer, target) > 2){
        healer.moveTo(target);
    }
}