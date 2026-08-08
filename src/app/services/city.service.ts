import pool from "../../config/database";

export const getCities = async () => {
    const cityResult = await pool.query('SELECT * FROM cities');
    
    return cityResult.rows;
}