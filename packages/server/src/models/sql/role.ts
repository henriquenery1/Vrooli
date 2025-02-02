import { PrismaType } from "../../types";
import { Role } from "../../schema/types";
import { FormatConverter, addJoinTablesHelper, removeJoinTablesHelper } from "./base";

//==============================================================
/* #region Custom Components */
//==============================================================

const joinMapper = { users: 'user' };
export const roleFormatter = (): FormatConverter<Role, any> => ({
    relationshipMap: {
        '__typename': 'Role',
        'users': 'User',
    },
    addJoinTables: (partial) => {
        return addJoinTablesHelper(partial, joinMapper);
    },
    removeJoinTables: (data) => {
        return removeJoinTablesHelper(data, joinMapper);
    },
})

//==============================================================
/* #endregion Custom Components */
//==============================================================

//==============================================================
/* #region Model */
//==============================================================

export const RoleModel = ({
    prismaObject: (prisma: PrismaType) => prisma.role,
    format: roleFormatter(),
})

//==============================================================
/* #endregion Model */
//==============================================================