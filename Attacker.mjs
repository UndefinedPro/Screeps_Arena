import { ERR_NOT_IN_RANGE } from "game/constants";


// 注：只定义单体行为，群体行为通过上层结构进行封装


export function AttackEnenmy(AttackScreep, enemy){
    if(AttackScreep.attack(enemy) == ERR_NOT_IN_RANGE){ 
        AttackScreep.moveTo(enemy);
    }
}

/*
// 远程攻击，目前没搞明白怎么用
export function RangedAttackEnenmy(AttackScreep, enemy){
    
    let targets = AttackScreep.findInRange(enemy);
    if (targets.length) {
        AttackScreep.rangedAttack(targets[0]);
    }
}
*/