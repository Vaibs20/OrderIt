import React, { useEffect } from 'react'
import { getrestaurants } from '../../actions/restaurantAction'
import { useDispatch, useSelector } from 'react-redux';

export default function Countrestaurant() {
  const dispatch=useDispatch();
  const {loading,error,count,showVegOnly,pureVegRestaurantsCount}=useSelector((state)=>state.restaurants);
  useEffect(()=>{
    dispatch(getrestaurants());
  },[dispatch]);
  return (
    <div>
      {loading? (<p>Loading Restaurant Count ...</p>
    ): error?(
    <p>Error:{error}</p>
    ):(
      <p className="NumOfRestro">
        {showVegOnly? pureVegRestaurantsCount: count} <span className="Restro">
          {showVegOnly
          ?pureVegRestaurantsCount===1
        ?"restaurant":"restaurants":count===1?
        "restaurant":"restaurants"}
        </span>
      </p>
    )}
    </div>
  )
}
