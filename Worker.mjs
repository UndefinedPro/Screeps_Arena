import { ATTACK, CARRY, ERR_NOT_IN_RANGE, MOVE, RESOURCE_ENERGY, WORK } from "game/constants";

// 注：只定义单体行为，群体行为通过上层结构进行封装


export function HaverstCreep(WorkerScreep, targetSource, spawn){
    if(WorkerScreep.store.getFreeCapacity(RESOURCE_ENERGY) > 25){
        if (WorkerScreep.withdraw(targetSource,RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            WorkerScreep.moveTo(targetSource);
        }
    }
    else{
        if (WorkerScreep.transfer(spawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
            WorkerScreep.moveTo(spawn);
        }
    }
}