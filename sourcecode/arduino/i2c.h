#include <stdint.h>
#include <util/twi.h>

#define MPU_6050 0xd0 // I2C address of IMU chip

#define FSYNC_INT_EN 2

// initialize I2C communication
static inline void I2C_init(void);

// register schreiben (see https://de.wikipedia.org/wiki/POKE_und_PEEK)
void I2C_poke(uint8_t address, uint8_t reg, uint8_t value);

// send bytes to device, i.e., poke to several concecutive registers
void I2C_send(uint8_t address, unsigned char *data, uint8_t bytes_to_write);

// retrieve a sequence of bytes from an I2C device, i.e. peek for several concecutive registers
void I2C_read_registers(uint8_t address, uint8_t start_register, uint8_t *data, uint8_t bytes_to_read);
