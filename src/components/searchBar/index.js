import React from 'react'
import { InputGroup, InputGroupAddon, Input, Button} from 'reactstrap'
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

const SearchBar = (props) => {
    const { setSearchValue } = props
    return(

            // <TextField
            //     value={query}
            //     onChange={(event)=>(setSearchValue(event.currentTarget.value),setQuery(event.currentTarget.value))}
            //     placeholder={'Search'}
            //     className={styles.SearchBar}
            // />

        <div>
            <InputGroup style={{width: '100%'}}>
                <InputGroupAddon addonType="append">
                    <Button>
                        <FontAwesomeIcon icon={faSearch}></FontAwesomeIcon>
                    </Button>
                </InputGroupAddon>
                <Input placeholder = "SEARCH" onChange={(event) => {
                    // console.log(event.target.value)
                    // var temp = allTimeStampsBySong?.filter((timestamps) => (timestamps[0].song.name.toLowerCase().includes(event.target.value.toLowerCase())))
                    // setTimeStampsBySong(temp)
                    setSearchValue(event.target.value)
                }}></Input>
            </InputGroup>
        </div>
    )
    
}

export default (SearchBar);