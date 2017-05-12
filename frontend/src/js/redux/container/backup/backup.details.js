import { connect } from 'react-redux';
import BackupDetails from '../../../ui/backup/view/backup.details';
import object from '../../../utility/object';


const mapStateToProps = (state, ownProps) => {
    const backupConfigs = state.get("data").getIn(["backupConfigs", "data"]);
    const id = ownProps.params.backupId;
    const backupConfig = object.filterArrWithKeyValue("id", id, backupConfigs)[0];
    const allCopyDBs = state.get("data").getIn(["copyDBs", "data"]);
    const copyDBs = object.filterArrWithKeyValue("id", id, allCopyDBs);
    const allOriginalDBs = state.get("data").getIn(["originalDBs", "data"]);
    const originalDB = object.filterArrWithKeyValue("id", id, allOriginalDBs)[0];

    const ids = backupConfigs.map(backupConfig => backupConfig.id);

    return {
        backupConfig,
        copyDBs,
        originalDB,
        ids
    }
};

const mapDispatchToProps = (dispatch) => {
    return {

    };
};

const Container = connect(mapStateToProps, mapDispatchToProps)(BackupDetails);

export default Container;